### 1. Documento de Requerimientos Técnicos (TRD)

#### 1.1 Unificación de la Identidad Heterogénea (.NET 9 & Node.js)

Para consolidar el **Single Sign-On (SSO)** y el **Segundo Factor de Autenticación (MFA)**, desacoplaremos la capa de identidad de los backends delegando la confianza en **Keycloak** como *Identity Provider (IdP)* unificado bajo el estándar **OpenID Connect (OIDC) / OAuth2**.

```
[React (A)]    ---(OAuth2 / PKCE)--->    [ Keycloak IdP ]    <---(OAuth2 / PKCE)---    [Angular 20 (B)]
    |                                    (MFA / TOTP)                                     |
(Bearer JWT)                                                                         (Bearer JWT)
    v                                                                                     v
[Express API]  <=======(Trama Cifrada / Envelope Encryption / HTTPS)========>        [YARP Gateway / .NET]

```

* **Flujo de Autenticación de Frontends:** Tanto la SPA de React (Sistema A) como la SPA de Angular 20 (Sistema B) implementarán el *Authorization Code Flow con PKCE* directamente contra el Realm de Keycloak. Al compartir las cookies de sesión del navegador en el dominio del IdP, se garantiza el SSO transparente.
* **MFA Centralizado:** Se activa la directiva `OTP Form: Required` a nivel de flujo de navegador en Keycloak, forzando contraseñas basadas en tiempo (TOTP) sin impactar el código de los frontends.
* **Validación de Tokens en el Borde (Edge Validation):**
* **Sistema A (Node.js):** El middleware `express-jwt` utilizará `jwks-rsa` para descargar dinámicamente las claves públicas asimétricas del endpoint `/certs` de Keycloak, validando la firma del JWT en algoritmo **RS256**.
* **Sistema B (.NET 9):** El componente `JwtBearer` se configurará en el `GatewayApi` (YARP) definiendo la propiedad `Authority` hacia Keycloak. Las APIs internas (`UsersApi`, `ReservasApi`) heredarán la validación en cascada o consumirán el mismo endpoint JWKS.



#### 1.2 Federación en Bases de Datos Heterogéneas (PostgreSQL & SQLite)

El mayor riesgo técnico es la inconsistencia de datos al no existir llaves foráneas entre el PostgreSQL de Foodies y el SQLite de Cathering.

* **Solución Arquitectónica:** Se prohíbe el uso de IDs numéricos autoincrementales locales para identificar al usuario en flujos inter-sistemas. El identificador maestro universal de la arquitectura será el claim **`sub` (Subject)** provisto en el JWT por Keycloak (un formato GUID/UUID String invariantivo).
* **Aprovisionamiento Just-In-Time (JIT):** Cuando un usuario se autentica en Keycloak y su frontend invoca por primera vez a un backend, este último intercepta el `req.user.sub` (Node) o el `User.FindFirst(ClaimTypes.NameIdentifier)` (.NET), y si el ID no existe en SQLite o PostgreSQL, se autocrea el registro de perfil localmente de forma asíncrona o al vuelo (JIT), sincronizando `username` y `email`.

#### 1.3 Integración del KMS (Canal Cifrado A -> B)

Para cumplir con el envío de la trama encriptada desde el Sistema A hacia el Sistema B, se descarta el uso de llaves simétricas compartidas en archivos `.env` (vulnerabilidad estructural). Implementaremos **Cifrado de Sobre (Envelope Encryption)** mediante un KMS de un tercero (AWS KMS).

1. **Sistema A (Node.js)** solicita mediante el SDK una *Data Key* simétrica efímera al KMS.
2. El KMS retorna la *Data Key* en texto plano y la *Data Key* cifrada con la Clave Maestra (CMK).
3. El Sistema A cifra los datos del contrato con **AES-256-GCM** usando la llave en texto plano y destruye la llave de la memoria.
4. El Sistema A envía al Gateway del Sistema B la trama cifrada junto con la *Data Key* encriptada.
5. El **Sistema B (.NET 9)** toma la *Data Key* encriptada y le pide al KMS que la descifre. El KMS devuelve la llave en texto plano de forma segura, permitiendo al Sistema B descifrar el payload localmente.

---

### 2. Backend Esquema (Data Contract JSON)

Este es el objeto estructurado (Data Contract) que el Sistema A enviará al Sistema B para registrar transacciones o reservas de manera segura. El payload de negocio va completamente ofuscado bajo un sobre criptográfico.

```json
{
  "integrationHeader": {
    "sourceSystem": "APP_CATHERING_NODEJS",
    "targetSystem": "FOODIES_BACKWEB_NET9",
    "timestamp": "2026-06-21T18:55:30Z",
    "kmsKeyId": "arn:aws:kms:us-east-1:123456789012:key/vulnerabilidad-mitigada-uuid"
  },
  "cryptoEnvelope": {
    "encryptedDataKey": "AQIDAHijb3V5Sl...[Llave de datos simétrica cifrada por el KMS en Base64]...",
    "iv": "dGhpcyBpcyBhbiBpdg==",
    "authTag": "rS2Bc3mX9+uY1GzP8A==",
    "ciphertext": "eyJlbmNyeXB0ZWREYXRhIjogIkNyeXB0b2dyYXBoeVNlY3VyZURhdGEiLCAic3ViIjogImY0N2FjMTBiLTU4Y2MtNDM3Mi1hNTY3LTBlMDJiMmMzZDQ3OSIsICJhbGxlcmdpZXMiOiBbIk1hbmlfRGV0ZWN0YWRvIl0sICJ0cmFuc2FjY2lvbk1vbnRvIjogMTUuNTB9"
  }
}

```

* *Estructura del Texto Desencriptado interno (`ciphertext`):*
```json
{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "eduardo.salazar",
  "transactionAmount": 15.50,
  "detectedAllergies": ["Lactosa", "Maní"],
  "actionType": "SYNC_RESERVA_CATERING"
}

```



---

### 3. Flujo del Proyecto (Secuencia Unificada)

El siguiente flujo describe la interacción de los componentes desde que el usuario abre la aplicación hasta la sincronización cifrada de extremo a extremo:

```
Usuario        React SPA (A)       Keycloak IdP       Express API (A)     YARP / .NET (B)       AWS KMS
   |                 |                  |                   |                  |                   |
   |--- 1. Login --->|                  |                   |                  |                   |
   |                 |-- 2. Redirect -->|                   |                  |                   |
   |                 |   (Code + PKCE)  |                   |                  |                   |
   |<-- 3. Form/MFA -|                  |                   |                  |                   |
   |--- 4. OTP/Cred -|                  |                   |                  |                   |
   |                 |<- 5. Token JWT --|                   |                  |                   |
   |                 |   (Sign RS256)   |                   |                  |                   |
   |                 |                                      |                  |                   |
   |-- 6. GET /me -->|------------------------------------->|                  |                   |
   |   (Bearer JWT)  |                                      |-- 7. GET /certs -|                   |
   |                 |                                      |   (Descarga JWKS)|                   |
   |                 |                                      |<-- 8. Public Key-|                   |
   |                 |                                      | [Valida Token y  |                   |
   |                 |                                      |  Aprovisiona JIT]|                   |
   |                 |                                      |                  |                   |
   |                 |                                      |-- 9. GenDataKey -------------------->|
   |                 |                                      |<-- 10. Plain/Cipher Keys ------------|
   |                 |                                      | [Cifra Payload   |                   |
   |                 |                                      |  con AES-GCM]    |                   |
   |                 |                                      |                  |                   |
   |                 |                                      |-- 11. POST Trama Cifrada (JWT B.) -->|
   |                 |                                      |                  |-- 12. Decrypt --->|
   |                 |                                      |                  |<- 13. Plain Key---|
   |                 |                                      |                  | [Descifra datos,  |
   |                 |                                      |                  |  valida roles e   |
   |                 |                                      |                  |  inserta en PgSQL]|
   |<-- 14. Éxito ---|<-------------------------------------|<-----------------|                   |

```

---

### 4. Historias de Usuario (Agile Backlog)

#### HU-01: Autenticación Unificada Basada en OIDC (Rúbrica: Autenticación)

* **Como** usuario del ecosistema institucional,
* **Quiero** ser redirigido a un portal de identidad centralizado al intentar ingresar a la aplicación de catering o de reservas,
* **Para** que mis credenciales no sean expuestas ni gestionadas de manera independiente por los backends locales.
* **Criterios de Aceptación:**
1. El intento de acceso a rutas protegidas en React o Angular debe disparar una redirección al Authorization Endpoint de Keycloak.
2. La eliminación del campo `passwordHash` en SQLite y PostgreSQL no debe impedir el flujo, delegando la validación del usuario por completo al IdP.



#### HU-02: Control de Acceso por Roles del Reino (Rúbrica: Autorización)

* **Como** Lead Developer,
* **Quiero** que los middlewares de Node.js y los filtros de .NET validen la sección de `realm_access.roles` dentro del JWT,
* **Para** denegar el acceso a funciones administrativas (como la asignación de roles o recargas de saldo) a usuarios sin privilegios.
* **Criterios de Aceptación:**
1. El endpoint `.NET 9` `POST /api/users/{id}/roles` debe retornar un código de estado `403 Forbidden` si el JWT no contiene explícitamente el rol `admin`. Se remueve la directiva `AllowAnonymous` heredada.



#### HU-03: Sesión Única Transversal - SSO (Rúbrica: SSO)

* **Como** estudiante universitario,
* **Quiero** iniciar sesión una sola vez en la aplicación de React y acceder a la aplicación de Angular 20 sin reintroducir mis credenciales,
* **Para** mejorar la experiencia de usuario y mantener un ciclo de vida unificado de la sesión.
* **Criterios de Aceptación:**
1. Al autenticarse en el cliente `cathering-react`, abrir en otra pestaña el cliente `foodies-angular` debe permitir saltarse el login, recuperando de forma automática el estado de autenticación de la sesión activa en el navegador web.



#### HU-04: Segundo Factor de Autenticación Mandatorio (Rúbrica: 2FA/MFA)

* **Como** oficial de seguridad de la información,
* **Quiero** obligar al usuario a introducir un código dinámico OTP desde su aplicación móvil durante el proceso de autenticación,
* **Para** mitigar el riesgo de secuestro de cuentas mediante ataques de fuerza bruta o credenciales filtradas.
* **Criterios de Aceptación:**
1. Tras ingresar la contraseña correcta en Keycloak, el flujo de autenticación debe bloquearse solicitando de forma obligatoria el token OTP (TOTP).
2. No se emitirá el JWT definitivo hasta que el segundo factor sea validado con éxito.



#### HU-05: Federación de Usuarios e Integridad de Datos (Rúbrica: Federación)

* **Como** administrador de sistemas,
* **Quiero** indexar la persistencia de SQLite y PostgreSQL utilizando el claim unificado `sub` del token,
* **Para** garantizar que la información sensible de alergias y billeteras del Sistema A coincida exactamente con las reservas del Sistema B.
* **Criterios de Aceptación:**
1. El controlador de Node.js debe implementar aprovisionamiento *Just-In-Time* (JIT); si el UUID del token no existe en SQLite, debe crearlo al vuelo para permitir transacciones inmediatamente.



#### HU-06: Cifrado de Canales Síncronos Inter-Sistemas vía KMS (Rúbrica: KMS)

* **Como** Arquitecto de Software Seguro,
* **Quiero** que el microservicio de órdenes de Node.js cifre el payload confidencial mediante el patrón *Envelope Encryption* de AWS KMS antes de enviarlo al Gateway de .NET,
* **Para** garantizar la confidencialidad absoluta de los datos de salud y transaccionales en tránsito.
* **Criterios de Aceptación:**
1. El Sistema B debe rechazar peticiones que contengan payloads legibles en texto plano en la ruta de integración síncrona.
2. El Sistema B debe invocar el servicio AWS KMS de forma exitosa para recuperar la llave simétrica y descifrar la trama con AES-256-GCM.



---

### 5. Plan de Implementación (Sprint Schedule)

Para ajustarse estrictamente al esquema ágil del proyecto integrador, dividiremos las 8 horas de desarrollo estimadas en tres fases incrementales bien definidas dentro de un solo Sprint:

* **Fase 1: Configuración de la Infraestructura de Confianza (Horas 1 - 2.5)**
* *Tareas:* Levantar el archivo `docker-compose.yml` con Keycloak + PostgreSQL. Configurar el Realm `proyecto-seguro`, los 4 clientes (`cathering-react`, `foodies-angular`, `cathering-backend`, `foodies-backend`), activar el OTP requerido y aprovisionar la clave simétrica (CMK) en la consola de AWS KMS.


* **Fase 2: Desacoplamiento de Identidad y Adaptabilidad Backend (Horas 2.5 - 5.5)**
* *Tareas:* Modificar el `UserModel.js` en SQLite y las entidades en Postgres para soportar las llaves primarias en formato `STRING/UUID`. Limpiar y remover las columnas `passwordHash`. Implementar la validación asimétrica JWKS en `AuthMiddleware.js` (Node) y configurar la autenticación en cascada JwtBearer en el API Gateway YARP de .NET 9. Codificar el mecanismo JIT en el perfil del `UserController.js`.


* **Fase 3: Implementación del Sobre Criptográfico y Cierre (Horas 5.5 - 8)**
* *Tareas:* Escribir el script emisor en Node.js utilizando el SDK de AWS KMS (`GenerateDataKeyCommand` + cifrado local `crypto` AES-GCM). Codificar la lógica de recepción y descifrado en el controlador de .NET 9 (`AmazonKeyManagementServiceClient`). Ejecutar las pruebas de integración cruzadas E2E y correr las herramientas de verificación de código estático (SonarQube) para validar el cierre de brechas de seguridad del incremento.