# Cathering + Foodies: Ecosistema Web Seguro

Proyecto integrador para la materia **Desarrollo de Software Seguro**. El repositorio contiene dos sistemas web independientes integrados mediante **Keycloak** para identidad centralizada, **SSO**, roles, **2FA/OTP** y una comunicacion segura entre sistemas usando **KMS**.

## Resumen

El ecosistema integra:

- **Sistema A - Cathering**: aplicacion React + Node.js para gestion de cafeteria escolar.
- **Sistema B - Foodies**: aplicacion Angular + .NET para gestion de usuarios, formularios, reservas, restaurantes y administracion.
- **Proveedor de identidad - Keycloak**: autenticacion, autorizacion, SSO, roles por plataforma y segundo factor OTP.
- **KMS - LocalStack/AWS KMS**: cifrado de tramas desde Cathering hacia Foodies.

La finalidad es que los usuarios no inicien sesion por separado en cada sistema. Ambos frontends redirigen a Keycloak y consumen tokens OIDC/JWT para determinar identidad, roles y acceso.

## Arquitectura

```text
Usuario
  |
  | Login centralizado
  v
Keycloak realm proyecto-seguro
  |
  | Tokens OIDC/JWT con roles
  v
+----------------------+       Trama cifrada KMS       +----------------------+
| Sistema A Cathering  | ----------------------------> | Sistema B Foodies    |
| React + Node.js      |                               | Angular + .NET       |
+----------------------+                               +----------------------+
  |                                                       |
  | cifra payload con KMS                                 | descifra payload con KMS
  v                                                       v
LocalStack / AWS KMS                                ReservasApi Integration
```

## Objetivos de seguridad cubiertos

| Requisito | Implementacion |
|---|---|
| Autenticacion | Login centralizado en Keycloak. |
| Autorizacion | Roles globales y roles por cliente/plataforma. |
| SSO | Cathering y Foodies usan el mismo realm `proyecto-seguro`. |
| Segundo factor | Keycloak fuerza `CONFIGURE_TOTP` para OTP con app movil. |
| Federacion de usuarios | Keycloak centraliza identidades y el claim `sub` funciona como identificador maestro. |
| Comunicacion A -> B cifrada | Cathering envia una trama cifrada con KMS a Foodies. |
| Keycloak | Se usa OIDC Authorization Code + PKCE, roles, SSO y OTP. |

## Estructura del repositorio

```text
Cathering-Foodies-Ecosistema/
  Cathering3/                 Sistema A: React + microservicios Node.js
  FoodiesFrontWEB/            Frontend Angular del Sistema B
  FoodiesBackWEB/             APIs .NET del Sistema B
  keycloak-data/              Realm Keycloak importable
  docs/                       Documentacion tecnica y presentacion
  scripts/                    Scripts para levantar, probar y detener localmente
  docker-compose.yml          Infraestructura global: Keycloak + LocalStack
  CLONAR_Y_EJECUTAR.md        Guia rapida para ejecutar en otra computadora
  funcionamienbto.md          Explicacion detallada de funcionamiento
  local.env.example           Variables locales de referencia
```

## Componentes principales

### Cathering

- Frontend React en `Cathering3/frontend`.
- Gateway Node en `Cathering3/services/api-gateway`.
- Servicios Node para autenticacion, catalogo y ordenes.
- Integracion con Keycloak mediante tokens JWT.
- Cifrado de tokens internos y payloads con KMS.
- Endpoint emisor hacia Foodies:

```text
POST /api/orders/sync-foodies
```

### Foodies

- Frontend Angular en `FoodiesFrontWEB`.
- Gateway .NET/YARP en `FoodiesBackWEB/GatewayApi`.
- APIs .NET:
  - `UsersApi`
  - `FormularioFoodieApi`
  - `ReservasApi`
  - `AdminCoreApi`
- Login centralizado con Keycloak.
- Validacion de tokens Keycloak y JWT legado.
- Endpoint receptor de integracion cifrada:

```text
POST /api/integration/cathering
```

## Keycloak

Realm:

```text
proyecto-seguro
```

Clientes:

| Cliente | Uso |
|---|---|
| `cathering-react` | Frontend React de Cathering |
| `cathering-backend` | APIs Node de Cathering |
| `foodies-angular` | Frontend Angular de Foodies |
| `foodies-backend` | APIs .NET de Foodies |

Roles globales:

- `admin`
- `foodie`
- `restaurante`
- `estudiante`
- `cafeteria`
- `personal_academico`

Roles por plataforma:

- Foodies: `foodies_admin`, `foodies_foodie`, `foodies_restaurante`
- Cathering: `cathering_admin`, `cathering_estudiante`, `cathering_cafeteria`, `cathering_personal_academico`

## Usuarios demo

| Usuario | Password | Plataforma principal |
|---|---|---|
| `admin` | `Admin123!` | Ambas |
| `foodie` | `Foodie123!` | Foodies |
| `restaurante` | `Restaurante123!` | Foodies |
| `estudiante` | `Estudiante123!` | Cathering |
| `cafeteria` | `Cafeteria123!` | Cathering |
| `personal` | `Personal123!` | Cathering |

Todos los usuarios demo tienen OTP obligatorio. En el primer inicio de sesion Keycloak solicita configurar una app movil como Google Authenticator, Microsoft Authenticator o Authy.

## Ejecucion local

Requisitos:

- Windows con PowerShell.
- Git.
- Docker Desktop.
- Node.js 20 o superior.
- .NET SDK 9.

Clonar y levantar:

```powershell
git clone https://github.com/EduSalazar0/Cathering-Foodies-Ecosistema.git
cd Cathering-Foodies-Ecosistema
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\start-local.ps1
```

URLs principales:

| Servicio | URL |
|---|---|
| Keycloak | `http://localhost:8080` |
| LocalStack/KMS | `http://localhost:4566` |
| Cathering | `http://localhost:5174` |
| Foodies | `http://localhost:4200` |
| Foodies Gateway | `http://localhost:5111` |

## Pruebas

Validar el ecosistema completo:

```powershell
.\scripts\test-local.ps1
```

La prueba verifica:

- Keycloak disponible.
- LocalStack/KMS disponible.
- Cathering frontend disponible.
- Foodies frontend disponible.
- APIs protegidas con `401` cuando no hay token.
- OTP activo como accion obligatoria en Keycloak.
- Comunicacion Cathering -> Foodies con payload cifrado y descifrado por KMS.

Detener todo:

```powershell
.\scripts\stop-local.ps1
```

## Documentacion

- [CLONAR_Y_EJECUTAR.md](./CLONAR_Y_EJECUTAR.md): guia rapida para ejecutar en otra computadora.
- [funcionamienbto.md](./funcionamienbto.md): explicacion completa del funcionamiento y cambios por sistema.
- [docs/PROYECTO_INTEGRADOR.md](./docs/PROYECTO_INTEGRADOR.md): planteamiento tecnico y backlog.
- [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md): guia tecnica de integracion.
- [docs/SPRINT_REVIEW_CIERRE.md](./docs/SPRINT_REVIEW_CIERRE.md): cierre tipo sprint review.

## Flujo de demostracion sugerido

1. Ejecutar `.\scripts\start-local.ps1`.
2. Abrir Cathering en `http://localhost:5174`.
3. Iniciar sesion con un usuario de Cathering y configurar OTP.
4. Abrir Foodies en `http://localhost:4200`.
5. Iniciar sesion con la misma sesion Keycloak para demostrar SSO.
6. Ejecutar `.\scripts\test-local.ps1` para demostrar la integracion cifrada A -> B.

## Estado del proyecto

El repositorio esta preparado para demostracion local. No esta orientado a despliegue productivo; las contrasenas y valores locales incluidos son de laboratorio para reproducir el entorno academico en otra computadora.

La configuracion productiva debe separar secretos, usar HTTPS, rotacion de credenciales, bases de datos administradas y politicas estrictas de despliegue.
