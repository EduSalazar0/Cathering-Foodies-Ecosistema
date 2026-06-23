# Guía de Integración y Seguridad (Sistema A ↔ Sistema B)

Este documento define el contrato de arquitectura y ciberseguridad establecido en el **Sistema A**. El objetivo es proveer a los desarrolladores del **Sistema B** las directrices técnicas necesarias para acoplar sus microservicios de forma fluida, respetando la topología *Zero-Trust* implementada.

---

## 1. Visión General de la Arquitectura

El ecosistema opera bajo estrictos protocolos criptográficos para evitar vulnerabilidades de intercepción y asegurar el principio de No Repudio:
- **Criptografía en Reposo:** Todos los datos financieros (saldos de billeteras y montos en bitácoras de transacciones) se cifran en la base de datos (SQLite) utilizando AWS KMS.
- **Criptografía en Tránsito:** Ningún token de sesión (JWT) viaja en texto plano a través de la red interna de contenedores de Docker.
- **SSO Centralizado:** Keycloak actúa como el único Proveedor de Identidad, inyectando claims personalizados críticos para la lógica de negocio.

---

## 2. Contrato de Red (El Gateway como Terminador)

Todas las peticiones generadas por el Frontend (o clientes externos) hacia tus microservicios en el Sistema B **deben** ser canalizadas obligatoriamente a través del **API Gateway Central (`localhost:3000`)**.

El Frontend seguirá enviando el token normalmente:
```http
Authorization: Bearer eyJhbGciOiJSUzI1Ni...
```

**Acción del API Gateway:**
Antes de reenviar la petición hacia los microservicios internos, el Gateway actúa como un escudo criptográfico:
1. Extrae el JWT en texto plano del header `Authorization`.
2. Encripta la cadena completa del JWT utilizando el servicio local de AWS KMS.
3. Inyecta este nuevo bloque cifrado en el header **`x-encrypted-session-token`**.
4. **Purga** y elimina completamente el header `Authorization` original de la petición.

Tus microservicios en el Sistema B recibirán peticiones sin la cabecera `Authorization`.

---

## 3. Implementación en el Sistema B (Crucial)

Para que tus controladores puedan validar la sesión de los usuarios y no rechacen las peticiones con un `401 Unauthorized`, debes implementar nuestro **Wrapper Asíncrono de KMS** sobre tu validador de JWT.

### Requisitos Previos:
- Instalar la dependencia de KMS: `npm install @aws-sdk/client-kms`.
- Disponer del archivo `KmsService.js` configurado hacia el alias maestro (`alias/cathering-wallet-key`).

### Código a implementar (`AuthMiddleware.js`)
Sustituye la configuración estándar de `express-jwt` en tus servicios por este bloque de código exacto. Este wrapper interceptará el token cifrado, llamará a KMS para restaurarlo y se lo inyectará al validador para verificar la firma de Keycloak.

```javascript
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const kmsService = require("../services/KmsService"); // <-- Ajusta la ruta

const jwtValidator = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKS_URI 
    }),
    audience: ['cathering-backend', 'cathering-react', 'account'], 
    issuer: process.env.JWT_ISSUER,     
    algorithms: ["RS256"],              
    requestProperty: 'user', 
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
            return req.headers.authorization.split(" ")[1];
        }
        return null;
    }
});

const authMiddleware = async (req, res, next) => {
    try {
        const encryptedToken = req.headers['x-encrypted-session-token'];
        
        if (encryptedToken) {
            console.log(`[Sistema B Auth] Token cifrado detectado, desencriptando con KMS...`);
            const decryptedToken = await kmsService.decryptData(encryptedToken);
            
            // Reinyectar para el validador estándar
            req.headers.authorization = `Bearer ${decryptedToken}`;
        } else if (req.headers.authorization) {
            // Fallback (Modo Híbrido) para desarrollo local
            console.warn(`[Sistema B Auth] ADVERTENCIA: Haciendo fallback al header Authorization estándar.`);
        }

        return jwtValidator(req, res, next);
        
    } catch (error) {
        console.error('[Sistema B Auth] Error al desencriptar sesión:', error);
        return res.status(401).json({ error: 'Token de sesión corrupto o ilegible' });
    }
};

module.exports = authMiddleware;
```

---

## 4. Manejo de Identidad y Mapeo SSO

Una vez que el token atraviesa exitosamente el `authMiddleware`, la librería `express-jwt` lo decodificará y lo inyectará en el objeto global de la petición (`req.user`). 

Debes extraer la identidad del usuario de la siguiente manera estandarizada:

- **ID de Usuario (UUID):** Usa `req.user.sub` (Atributo nativo inmutable de Keycloak). *No confíes en `req.user.id`*.
- **Identificador de Sede/Colegio:** Usa `req.user.colegio_id` (Este es un custom claim que mapeamos específicamente en la carga útil del JWT para segmentar los datos multitenant).

---

## 5. Integración de Pagos y Billetera (Order Service)

El Sistema A gestiona de manera centralizada la billetera virtual. Si tu sistema necesita ejecutar un cobro, deberá comunicarse con el Endpoint de Creación de Órdenes del `order-service`. 

El microservicio verificará el saldo cifrado, ejecutará el descuento matemático y generará automáticamente un registro de auditoría (`TransactionModel`) con tipo `PAYMENT` guardando el monto extraído como un bloque KMS Base64 para el principio de *No Repudio*.

**Endpoint de Cobro (Backend a Backend):**
`POST http://order-service:3003/api/orders/`

**Formato Esperado (Body en JSON):**
El controlador espera recibir un array de `items` (que representan tu carrito/compra) con un `price` (Float) y `quantity` (Integer).

```json
{
  "items": [
    {
      "id": 101,
      "name": "Servicio Adicional de Cathering",
      "price": 5.50,
      "quantity": 1
    }
  ]
}
```

El microservicio procesará el arreglo, sumará los totales y contestará con `201 Created` y el `"nuevo_saldo"` resultante, o con un error `400 "Saldo insuficiente"`.
