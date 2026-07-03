# Funcionamiento del Proyecto Integrador

## 1. Resumen general

Este proyecto integra dos aplicaciones web independientes usando una arquitectura segura basada en control centralizado de identidades y comunicacion cifrada entre sistemas.

- Sistema A: Cathering, una aplicacion React + Node.js para gestion de cafeteria escolar.
- Sistema B: Foodies, una aplicacion Angular + .NET para gestion de usuarios, foodies, restaurantes, reservas y administracion.
- Control de identidades: Keycloak, usado como proveedor central de autenticacion, autorizacion, SSO, roles y segundo factor OTP.
- Cifrado entre sistemas: LocalStack simulando AWS KMS, usado para cifrar informacion desde Cathering hacia Foodies.

La idea principal es que Cathering y Foodies ya no manejen el inicio de sesion por separado. Los dos sistemas redirigen a Keycloak para autenticar al usuario. Una vez autenticado, Keycloak emite tokens OIDC/JWT y cada sistema usa esos tokens para saber quien es el usuario y que permisos tiene.

## 2. Objetivo academico cubierto

El proyecto cumple con los objetivos del enunciado de Desarrollo de Software Seguro:

- Autenticacion: Keycloak valida usuario y password.
- Autorizacion: Keycloak entrega roles y cada sistema filtra funcionalidades segun esos roles.
- SSO: una misma sesion de Keycloak permite ingresar a Cathering y Foodies.
- Segundo factor de autenticacion: Keycloak exige configurar OTP/TOTP con una app movil.
- Federacion de usuarios: Keycloak es la fuente central de usuarios; los sistemas usan el claim `sub` como identificador maestro.
- Comunicacion A hacia B cifrada: Cathering invoca un servicio de Foodies enviando una trama cifrada con KMS.

## 3. Arquitectura

Flujo general:

```text
Usuario
  |
  | abre Cathering o Foodies
  v
Sistema A Cathering React ----\
                               ---> Keycloak realm proyecto-seguro
Sistema B Foodies Angular ----/
  |
  | tokens JWT/OIDC con roles
  v
Backends Node.js y .NET validan tokens
  |
  | Cathering invoca Foodies con payload cifrado
  v
LocalStack / AWS KMS cifra y descifra la trama A -> B
```

Componentes principales:

- `Cathering3/frontend`: frontend React del Sistema A.
- `Cathering3/services/api-gateway`: gateway Node de Cathering.
- `Cathering3/services/auth-service`: servicio de usuarios/perfil de Cathering.
- `Cathering3/services/catalog-service`: servicio de catalogo/menu.
- `Cathering3/services/order-service`: servicio de ordenes, billetera y sincronizacion hacia Foodies.
- `FoodiesFrontWEB`: frontend Angular del Sistema B.
- `FoodiesBackWEB/GatewayApi`: gateway .NET/YARP del Sistema B.
- `FoodiesBackWEB/UsersApi`: usuarios y roles de Foodies.
- `FoodiesBackWEB/FormularioFoodieApi`: formularios para usuarios Foodie.
- `FoodiesBackWEB/ReservasApi`: reservas e integracion cifrada desde Cathering.
- `FoodiesBackWEB/AdminCoreApi`: administracion y analiticas.
- `keycloak-data/proyecto-seguro-realm.json`: configuracion del realm de Keycloak.
- `docker-compose.yml`: infraestructura de Keycloak, PostgreSQL de Keycloak y LocalStack.

## 4. Sistema A: Cathering

Cathering funciona como Sistema A porque es el sistema que inicia la comunicacion cifrada hacia Foodies.

### 4.1 Que hace Cathering

Cathering permite:

- Iniciar sesion usando Keycloak.
- Administrar usuarios escolares segun roles.
- Administrar colegio/cafeteria.
- Gestionar menu.
- Gestionar cocina y ordenes.
- Consultar menu como estudiante o personal academico.
- Gestionar alergias.
- Usar carrito.
- Usar billetera.
- Invocar un endpoint de Foodies enviando una trama cifrada con KMS.

### 4.2 Cambios realizados en Cathering frontend

Archivos principales:

- `Cathering3/frontend/src/main.jsx`
- `Cathering3/frontend/src/hooks/useAuth.jsx`
- `Cathering3/frontend/src/components/layout/ProtectedRoute.jsx`
- `Cathering3/frontend/src/pages/LoginPage.jsx`

Cambios:

1. Se configuro `react-oidc-context` para conectarse con Keycloak:

```js
authority: "http://localhost:8080/realms/proyecto-seguro"
client_id: "cathering-react"
response_type: "code"
scope: "openid profile email"
```

2. Se usa Authorization Code Flow con PKCE.

3. Se configuro el retorno correcto despues del login. Antes, despues de iniciar sesion, Cathering podia volver a una ruta generica. Ahora:

- Si el usuario intenta entrar a `/menu`, vuelve a `/menu`.
- Si intenta entrar a `/wallet`, vuelve a `/wallet`.
- Si intenta entrar a `/manage-users`, vuelve a `/manage-users`.
- Si entra directo por `/login`, se redirige segun rol.

4. Se agrego lectura de roles desde:

- `realm_access.roles`
- `resource_access.cathering-react.roles`
- `resource_access.cathering-backend.roles`

5. Se mapearon roles propios de Cathering:

- `cathering_admin` -> `admin`
- `cathering_estudiante` -> `estudiante`
- `cathering_cafeteria` -> `cafeteria`
- `cathering_personal_academico` -> `personal_academico`

Esto permite tener roles diferenciados por plataforma, pero sin romper el codigo existente que ya esperaba roles como `admin`, `cafeteria`, `estudiante` y `personal_academico`.

### 4.3 Rutas y roles en Cathering

Rutas principales:

- `/manage-users`: administracion de usuarios, rol `admin`.
- `/manage-colegio`: administracion de colegio, rol `admin`.
- `/manage-menu`: gestion de menu, rol `cafeteria`.
- `/kitchen`: cocina/ordenes, rol `cafeteria`.
- `/menu`: vista de menu, roles `estudiante` y `personal_academico`.
- `/allergies`: alergias, roles `estudiante` y `personal_academico`.
- `/cart`: carrito, roles `estudiante` y `personal_academico`.
- `/wallet`: billetera, roles `estudiante` y `personal_academico`.

### 4.4 Cambios realizados en servicios Node de Cathering

Archivos principales:

- `Cathering3/services/api-gateway/index.js`
- `Cathering3/services/api-gateway/src/services/KmsService.js`
- `Cathering3/services/auth-service/src/middlewares/AuthMiddleware.js`
- `Cathering3/services/catalog-service/src/middlewares/AuthMiddleware.js`
- `Cathering3/services/order-service/src/middlewares/AuthMiddleware.js`
- `Cathering3/services/order-service/src/services/KmsService.js`
- `Cathering3/services/order-service/src/controllers/OrderController.js`
- `Cathering3/services/order-service/src/routes/order.routes.js`

Cambios:

1. Los servicios Node validan tokens emitidos por Keycloak usando JWKS:

```text
http://keycloak:8080/realms/proyecto-seguro/protocol/openid-connect/certs
```

2. Se usa firma RS256.

3. El middleware acepta tokens normales por `Authorization: Bearer`.

4. Para la comunicacion segura interna, tambien acepta `x-encrypted-session-token`, lo descifra con KMS y reconstruye el token Bearer.

5. `order-service` agrega el endpoint:

```text
POST /api/orders/sync-foodies
```

Ese endpoint construye un payload de integracion y lo cifra antes de enviarlo al Sistema B.

## 5. Sistema B: Foodies

Foodies funciona como Sistema B porque recibe la invocacion cifrada desde Cathering y la descifra en su backend.

### 5.1 Que hace Foodies

Foodies permite:

- Iniciar sesion con Keycloak.
- Mostrar dashboard segun rol.
- Gestionar usuarios.
- Gestionar formularios Foodie.
- Gestionar restaurantes.
- Gestionar reservas.
- Consultar dashboards analiticos.
- Administrar roles.
- Recibir una trama cifrada desde Cathering.
- Descifrar la trama usando KMS.

### 5.2 Cambios realizados en Foodies frontend

Archivos principales:

- `FoodiesFrontWEB/src/app/core/services/auth.service.ts`
- `FoodiesFrontWEB/src/app/core/guards/auth.guard.ts`
- `FoodiesFrontWEB/src/app/core/interceptors/auth.interceptor.ts`
- `FoodiesFrontWEB/src/app/core/interceptors/error.interceptor.ts`
- `FoodiesFrontWEB/src/app/core/models/auth.model.ts`
- `FoodiesFrontWEB/src/app/modules/login/login.component.ts`
- `FoodiesFrontWEB/src/app/modules/login/login.component.html`
- `FoodiesFrontWEB/src/app/modules/login/login.component.css`
- `FoodiesFrontWEB/src/app/app.routes.ts`
- `FoodiesFrontWEB/src/environments/environment.development.ts`
- `FoodiesFrontWEB/src/environments/environment.production.ts`

Cambios:

1. Se elimino el flujo de login local como flujo principal.

2. La pantalla de login ahora solo redirige a Keycloak.

3. Se agrego Authorization Code Flow con PKCE manualmente en `AuthService`.

4. Se genera:

- `code_verifier`
- `code_challenge`
- `state`

5. Se envia al endpoint de autorizacion de Keycloak:

```text
http://localhost:8080/realms/proyecto-seguro/protocol/openid-connect/auth
```

6. Despues del login, Keycloak vuelve a:

```text
http://localhost:4200/login
```

7. Foodies procesa `code` y `state`, llama al token endpoint y guarda:

- `access_token`
- `refresh_token`
- fecha de expiracion
- usuario actual

8. Se corrigio el bug de dependencia circular:

Antes:

- `AuthService` usaba `HttpClient`.
- `HttpClient` pasaba por `authInterceptor`.
- `authInterceptor` inyectaba `AuthService`.
- Eso generaba `NG0200 Circular dependency`.

Ahora:

- `auth.interceptor.ts` no inyecta `AuthService`.
- Lee el token directamente de `localStorage`.
- Ignora llamadas hacia Keycloak.

9. Se corrigio el interceptor de errores:

- `error.interceptor.ts` ya no inyecta `AuthService`.
- No intercepta errores de Keycloak para evitar romper el callback OIDC.

10. Se agrego retorno inteligente despues del login:

- Si el usuario intentaba entrar a `/admincore/analytics`, vuelve a esa ruta.
- Si intentaba entrar a `/dashboard-foodie`, vuelve a esa ruta.
- Si intentaba entrar a `/restaurantes/dashboard`, vuelve a esa ruta.

11. Si entra directo por `/login`, redirige segun rol:

- `admin` o `foodies_admin` -> `/admincore`
- `restaurante` o `foodies_restaurante` -> `/restaurantes/dashboard`
- `foodie` o `foodies_foodie` -> `/dashboard-foodie`
- otros -> `/dashboard`

12. Se agrego lectura de roles desde:

- `realm_access.roles`
- `resource_access.foodies-angular.roles`
- `resource_access.foodies-backend.roles`

13. Se mapearon roles propios de Foodies:

- `foodies_admin` -> `admin`
- `foodies_foodie` -> `foodie`
- `foodies_restaurante` -> `restaurante`

### 5.3 Cambios realizados en Foodies backend

Archivos principales:

- `FoodiesBackWEB/GatewayApi/Security/FoodiesAuthenticationExtensions.cs`
- `FoodiesBackWEB/GatewayApi/Program.cs`
- `FoodiesBackWEB/GatewayApi/appsettings.json`
- `FoodiesBackWEB/UsersApi/Program.cs`
- `FoodiesBackWEB/UsersApi/Controllers/UsersController.cs`
- `FoodiesBackWEB/FormularioFoodieApi/Program.cs`
- `FoodiesBackWEB/ReservasApi/Program.cs`
- `FoodiesBackWEB/ReservasApi/ReservasApi.csproj`
- `FoodiesBackWEB/ReservasApi/Controllers/IntegrationController.cs`
- `FoodiesBackWEB/AdminCoreApi/Program.cs`

Cambios:

1. Se agrego autenticacion compatible con:

- JWT local legado.
- JWT emitido por Keycloak.

2. El backend detecta si el token viene de Keycloak revisando el `issuer`.

3. Para tokens Keycloak:

- usa `Authority` del realm `proyecto-seguro`.
- usa metadata OIDC.
- valida firma RS256.
- valida expiracion.
- extrae nombre desde `preferred_username`.

4. Se agrego extraccion de roles desde `realm_access`.

5. Se agrego extraccion de roles desde `resource_access`, para soportar roles por cliente/plataforma.

6. Se mapearon roles Foodies:

- `foodies_admin` -> `admin`
- `foodies_foodie` -> `foodie`
- `foodies_restaurante` -> `restaurante`

7. Se conectaron las APIs a la autenticacion central:

- `GatewayApi`
- `UsersApi`
- `ReservasApi`
- `FormularioFoodieApi`
- `AdminCoreApi`

8. Se corrigio una brecha de seguridad en `UsersApi`:

Antes, el endpoint para asignar roles podia quedar anonimo. Ahora:

```text
POST /api/users/{id}/roles
```

requiere politica:

```text
AdminOnly
```

9. Se agrego endpoint de integracion en Foodies:

```text
POST /api/integration/cathering
```

Este endpoint:

- recibe una trama cifrada.
- rechaza tramas en texto plano.
- usa AWS SDK KMS.
- se conecta a LocalStack.
- descifra la trama.
- devuelve confirmacion de integracion.

## 6. Keycloak

### 6.1 Realm

Realm:

```text
proyecto-seguro
```

Archivo:

```text
keycloak-data/proyecto-seguro-realm.json
```

Este archivo define:

- realm.
- clientes.
- roles globales.
- roles por cliente.
- usuarios demo.
- required action de OTP.

### 6.2 Clientes

Clientes configurados:

| Cliente | Sistema | Tipo | Uso |
|---|---|---|---|
| `cathering-react` | Sistema A | Public client | Frontend React |
| `cathering-backend` | Sistema A | Bearer only | APIs Node |
| `foodies-angular` | Sistema B | Public client | Frontend Angular |
| `foodies-backend` | Sistema B | Bearer only | APIs .NET |

### 6.3 Redirect URIs

Cathering:

```text
http://localhost:5173/*
http://127.0.0.1:5173/*
http://localhost:5174/*
http://127.0.0.1:5174/*
```

Foodies:

```text
http://localhost:4200/*
http://127.0.0.1:4200/*
```

### 6.4 Roles globales

Roles globales del realm:

- `admin`
- `foodie`
- `restaurante`
- `estudiante`
- `cafeteria`
- `personal_academico`

Estos roles sirven para compatibilidad y para demostrar una administracion central de identidades.

### 6.5 Roles diferenciados por plataforma

Para cumplir mejor el criterio de separacion entre Sistema A y Sistema B, tambien se agregaron roles por cliente.

Foodies:

- `foodies_admin`
- `foodies_foodie`
- `foodies_restaurante`

Cathering:

- `cathering_admin`
- `cathering_estudiante`
- `cathering_cafeteria`
- `cathering_personal_academico`

Esto permite demostrar que un usuario puede tener permisos en una plataforma sin necesariamente tener permisos en la otra.

### 6.6 Usuarios demo

Usuarios configurados:

| Usuario | Password | Plataforma principal | Roles |
|---|---|---|---|
| `admin` | `Admin123!` | Ambas | admin global, roles Foodies y roles Cathering |
| `foodie` | `Foodie123!` | Foodies | `foodie`, `foodies_foodie` |
| `restaurante` | `Restaurante123!` | Foodies | `restaurante`, `foodies_restaurante` |
| `estudiante` | `Estudiante123!` | Cathering | `estudiante`, `cathering_estudiante` |
| `cafeteria` | `Cafeteria123!` | Cathering | `cafeteria`, `cathering_cafeteria` |
| `personal` | `Personal123!` | Cathering | `personal_academico`, `cathering_personal_academico` |

Todos tienen:

```text
CONFIGURE_TOTP
```

Eso fuerza la configuracion del segundo factor en el primer inicio de sesion.

## 7. SSO

SSO significa Single Sign-On. En este proyecto funciona asi:

1. El usuario abre Cathering o Foodies.
2. Si no tiene sesion, el sistema lo redirige a Keycloak.
3. El usuario inicia sesion en Keycloak.
4. Keycloak crea una sesion en el navegador.
5. Si luego el usuario abre el otro sistema, ese sistema tambien redirige a Keycloak.
6. Como Keycloak ya tiene sesion activa, no pide usuario/password otra vez.
7. Keycloak emite un token nuevo para el otro cliente.
8. El usuario entra al segundo sistema con la misma sesion centralizada.

Esto cumple:

- Un solo login.
- Dos sistemas independientes.
- Misma identidad federada.
- Roles por plataforma.

## 8. Segundo factor de autenticacion

Keycloak exige `CONFIGURE_TOTP`.

Flujo:

1. Usuario inicia sesion con usuario/password.
2. Keycloak detecta que debe configurar OTP.
3. Muestra un QR.
4. El usuario lo escanea con una app movil, por ejemplo:
   - Google Authenticator.
   - Microsoft Authenticator.
   - Authy.
5. La app genera codigos de 6 digitos.
6. El usuario confirma el codigo.
7. En siguientes logins, Keycloak pedira el codigo OTP.

La ventaja es que Cathering y Foodies no implementan OTP manualmente. El segundo factor queda centralizado en Keycloak.

## 9. Federacion de usuarios

En esta implementacion, la federacion se maneja centralizando la identidad en Keycloak.

El identificador maestro es:

```text
sub
```

`sub` es un UUID emitido por Keycloak.

Uso por sistema:

- Cathering usa `profile.sub` / `req.user.sub`.
- Foodies acepta `User.id` como `number | string`, porque Keycloak usa UUID.
- Los backends no deben confiar en IDs numericos locales para integracion entre sistemas.

Esto evita duplicar identidades incompatibles entre Cathering y Foodies.

## 10. KMS y comunicacion cifrada Sistema A -> Sistema B

### 10.1 Objetivo

El enunciado exige:

```text
El sistema A puede invocar un servicio que expone el sistema B.
Invocar un servicio desde A hacia B con la trama encriptada.
Utilizar un KMS que permita invocar la encriptacion en A y desencriptacion en B.
```

En este proyecto:

- Sistema A: Cathering.
- Sistema B: Foodies.
- KMS: LocalStack simulando AWS KMS.

### 10.2 KMS usado

Servicio:

```text
LocalStack AWS KMS
```

Alias:

```text
alias/cathering-wallet-key
```

Endpoint local:

```text
http://localhost:4566
```

Endpoint interno Docker:

```text
http://localstack_aws:4566
```

### 10.3 Flujo de cifrado

1. Cathering genera un payload de integracion.
2. El payload incluye informacion minima:
   - `sub`
   - usuario/email
   - roles
   - timestamp
   - tipo de accion
3. Cathering llama a KMS para cifrar el payload.
4. Cathering envia a Foodies un envelope con:
   - metadatos
   - alias KMS
   - payload cifrado
5. Foodies recibe la trama en `ReservasApi`.
6. Foodies rechaza texto plano.
7. Foodies llama a KMS para descifrar.
8. Foodies procesa la accion.

### 10.4 Endpoint emisor en Cathering

Archivo:

```text
Cathering3/services/order-service/src/controllers/OrderController.js
```

Ruta:

```text
POST /api/orders/sync-foodies
```

### 10.5 Endpoint receptor en Foodies

Archivo:

```text
FoodiesBackWEB/ReservasApi/Controllers/IntegrationController.cs
```

Ruta:

```text
POST /api/integration/cathering
```

Gateway:

```text
POST /integration/cathering
```

## 11. Puertos locales

Infraestructura:

| Servicio | URL |
|---|---|
| Keycloak | `http://localhost:8080` |
| LocalStack/KMS | `http://localhost:4566` |
| PostgreSQL Keycloak | `localhost:15432` |

Cathering:

| Servicio | URL |
|---|---|
| Frontend React | `http://localhost:5174` |
| API Gateway Node | `http://localhost:3000` |
| Auth Service | interno `3001` |
| Catalog Service | interno `3002` |
| Order Service | interno `3003` |

Foodies:

| Servicio | URL |
|---|---|
| Frontend Angular | `http://localhost:4200` |
| Gateway .NET | `http://localhost:5111` |
| UsersApi | `http://localhost:5001` |
| FormularioFoodieApi | `http://localhost:5003` |
| ReservasApi | `http://localhost:5004` |
| AdminCoreApi | `http://localhost:5005` |

Se cambio PostgreSQL de Keycloak de `5432` a `15432` porque en la maquina local el puerto `5432` ya estaba ocupado. Tambien se uso Cathering frontend en `5174` porque `5173` estaba ocupado por otro contenedor.

## 12. Como levantar el proyecto

Desde la raiz del repo:

```powershell
cd C:\Users\USER\Desktop\WEB\Cathering-Foodies-Ecosistema
docker compose up -d
```

Para Cathering:

```powershell
cd C:\Users\USER\Desktop\WEB\Cathering-Foodies-Ecosistema\Cathering3
docker compose up -d --build
```

Para Foodies frontend:

```powershell
cd C:\Users\USER\Desktop\WEB\Cathering-Foodies-Ecosistema\FoodiesFrontWEB
npm install
npx ng serve --host localhost --port 4200
```

Para Foodies backends, cada API se puede ejecutar con `dotnet run`. En la validacion local se usaron estos puertos:

```powershell
dotnet run --project FoodiesBackWEB\UsersApi\UsersApi.csproj --no-launch-profile
dotnet run --project FoodiesBackWEB\FormularioFoodieApi\FormularioFoodieApi.csproj --no-launch-profile
dotnet run --project FoodiesBackWEB\ReservasApi\ReservasApi.csproj --no-launch-profile
dotnet run --project FoodiesBackWEB\AdminCoreApi\AdminCoreApi.csproj --no-launch-profile
dotnet run --project FoodiesBackWEB\GatewayApi\GatewayApi.csproj --no-launch-profile
```

En produccion/local controlada se recomienda usar variables:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Production"
$env:ASPNETCORE_URLS="http://localhost:5001"
```

Para Gateway y AdminCore se uso `PORT` porque en modo production esos proyectos leen esa variable:

```powershell
$env:PORT="5111"
```

## 13. Pruebas realizadas

### 13.1 Build de Foodies frontend

```powershell
cd FoodiesFrontWEB
npx ng build --configuration development
```

Resultado:

```text
Build correcto.
```

### 13.2 Build de Cathering frontend

```powershell
cd Cathering3\frontend
npm run build
```

Resultado:

```text
Build correcto.
```

### 13.3 Build de backends Foodies

```powershell
dotnet build FoodiesBackWEB\GatewayApi\GatewayApi.csproj
dotnet build FoodiesBackWEB\UsersApi\UsersApi.csproj
dotnet build FoodiesBackWEB\ReservasApi\ReservasApi.csproj
dotnet build FoodiesBackWEB\FormularioFoodieApi\FormularioFoodieApi.csproj
dotnet build FoodiesBackWEB\AdminCoreApi\AdminCoreApi.csproj
```

Resultado:

```text
Compilacion correcta en los 5 proyectos.
```

### 13.4 Keycloak disponible

```powershell
Invoke-WebRequest http://localhost:8080/realms/proyecto-seguro/.well-known/openid-configuration
```

Resultado esperado:

```text
200 OK
```

### 13.5 Frontends disponibles

Foodies:

```powershell
Invoke-WebRequest http://localhost:4200
```

Cathering:

```powershell
Invoke-WebRequest http://localhost:5174
```

Resultado esperado:

```text
200 OK
```

### 13.6 Gateway protegido

```powershell
Invoke-WebRequest http://localhost:5111/api/users
```

Sin token debe devolver:

```text
401 Unauthorized
```

Eso demuestra que no se permite acceso anonimo a rutas protegidas.

### 13.7 KMS

Se probo cifrar y descifrar desde `order-service` usando `alias/cathering-wallet-key`.

Resultado esperado:

```json
{
  "encryptedLength": 136,
  "decrypted": "SMOKE_KMS_2026_07_03"
}
```

## 14. Relacion con la rubrica

| Criterio | Como se cumple |
|---|---|
| Autenticacion | Keycloak valida usuario/password para Cathering y Foodies. |
| Autorizacion | Roles globales y roles por cliente controlan acceso por sistema. |
| SSO | Ambos frontends usan el mismo realm `proyecto-seguro`. |
| Segundo factor | `CONFIGURE_TOTP` fuerza OTP con app movil. |
| Federacion de usuarios | Keycloak centraliza usuarios y el claim `sub` identifica al usuario. |
| Servicio A -> B cifrado | Cathering invoca Foodies con payload cifrado por KMS. |
| Keycloak extra | Se usa Keycloak con OIDC, PKCE, roles, SSO y OTP. |
| Agile / Sprint Review | Existen documentos en `docs/SPRINT_REVIEW_CIERRE.md` y presentacion `docs/SPRINT_REVIEW_SEGURIDAD.pptx`. |
| Auditoria / SAST | La presentacion y cierre documentan resultados y recomendaciones. |
| Etica algoritmica | Se documenta que la solucion no toma decisiones automatizadas y que los roles deben auditarse. |

## 15. Cambios principales por carpeta

### 15.1 `keycloak-data`

Se agrego:

```text
keycloak-data/proyecto-seguro-realm.json
```

Incluye:

- realm.
- clientes.
- usuarios demo.
- roles globales.
- roles por plataforma.
- OTP requerido.

### 15.2 `Cathering3`

Cambios:

- Integracion OIDC con Keycloak.
- Lectura de roles Keycloak.
- Retorno correcto despues de login.
- Validacion JWT en servicios Node.
- Middleware compatible con token cifrado.
- KMS para cifrar datos.
- Endpoint de sincronizacion hacia Foodies.

### 15.3 `FoodiesFrontWEB`

Cambios:

- Login centralizado con Keycloak.
- Eliminacion del login local como flujo principal.
- PKCE.
- Manejo de callback OIDC.
- Persistencia de token.
- Interceptores sin dependencia circular.
- Roles desde `realm_access` y `resource_access`.
- Redireccion por rol.
- Retorno a ruta original.

### 15.4 `FoodiesBackWEB`

Cambios:

- Autenticacion con Keycloak.
- Validacion JWT.
- Extraccion de roles globales y por cliente.
- Politicas `AdminOnly`.
- Proteccion de endpoint de asignacion de roles.
- Endpoint receptor de trama cifrada.
- Integracion con AWS SDK KMS.

### 15.5 `docs`

Se agregaron documentos para entrega:

- `docs/SPRINT_REVIEW_CIERRE.md`
- `docs/SPRINT_REVIEW_SEGURIDAD.pptx`
- `docs/artifact-build-manifest.json`

## 16. Flujo de demostracion sugerido

### 16.1 Demostracion de SSO

1. Abrir `http://localhost:5174`.
2. Entrar a una ruta protegida de Cathering.
3. Iniciar sesion en Keycloak.
4. Configurar OTP si es primer ingreso.
5. Confirmar que Cathering entra a la pagina correcta.
6. Abrir `http://localhost:4200`.
7. Presionar iniciar sesion.
8. Confirmar que Keycloak no vuelve a pedir password si la sesion sigue activa.
9. Confirmar que Foodies entra al dashboard segun rol.

### 16.2 Demostracion de roles diferenciados

Usar usuarios:

- `foodie`: debe entrar a Foodies como Foodie.
- `restaurante`: debe entrar a Foodies como Restaurante.
- `estudiante`: debe entrar a Cathering como Estudiante.
- `cafeteria`: debe entrar a Cathering como Cafeteria.
- `admin`: debe tener acceso administrativo en ambos sistemas.

### 16.3 Demostracion de 2FA

1. Usar un usuario nuevo o reiniciar required action.
2. Iniciar sesion.
3. Keycloak muestra QR.
4. Escanear con app movil.
5. Confirmar codigo.
6. Cerrar sesion.
7. Volver a iniciar sesion.
8. Keycloak pide codigo OTP.

### 16.4 Demostracion de KMS

1. Verificar que LocalStack este activo.
2. Verificar alias:

```powershell
docker exec localstack_aws awslocal kms list-aliases
```

3. Ejecutar una llamada desde Cathering hacia Foodies.
4. Confirmar que Foodies recibe trama cifrada.
5. Confirmar que Foodies descifra con KMS.

## 17. Problemas corregidos durante la integracion

### 17.1 Loop despues de login en Foodies

Problema:

Despues de login por Keycloak, Foodies volvia a `/login`.

Causa:

`AuthService` procesaba callback con `HttpClient`, pero el interceptor inyectaba `AuthService`, generando dependencia circular `NG0200`.

Solucion:

- `auth.interceptor.ts` lee token desde `localStorage`.
- `error.interceptor.ts` ya no inyecta `AuthService`.
- Las llamadas a Keycloak no son interceptadas.

### 17.2 Rutas perdidas despues del login

Problema:

Al entrar a una ruta protegida, despues del login se perdia la pagina original.

Solucion:

- Cathering guarda `cathering_post_login_return_url`.
- Foodies guarda `foodies_post_login_return_url`.
- Despues del callback se redirige a la pagina original.

### 17.3 Puertos ocupados

Problema:

`5432` y `5173` estaban ocupados localmente.

Solucion:

- PostgreSQL de Keycloak se publico como `15432:5432`.
- Cathering frontend se publico como `5174:5173`.

### 17.4 Realm ignorado por Git

Problema:

`.gitignore` ignoraba `keycloak-data`.

Solucion:

Se cambio `.gitignore` para ignorar datos locales pero permitir:

```text
keycloak-data/proyecto-seguro-realm.json
```

### 17.5 Repos separados

Problema:

FoodiesBackWEB y FoodiesFrontWEB estaban en repos separados y apuntaban a remotos antiguos.

Solucion:

- Se quitaron los remotos antiguos.
- Se copiaron ambos proyectos dentro del repo principal.
- Se subio todo al repo:

```text
https://github.com/EduSalazar0/Cathering-Foodies-Ecosistema
```

## 18. Estado final

El repo final contiene:

```text
Cathering-Foodies-Ecosistema/
  Cathering3/
  FoodiesBackWEB/
  FoodiesFrontWEB/
  keycloak-data/
  docs/
  docker-compose.yml
  README.md
  funcionamienbto.md
```

El commit publicado fue:

```text
036ed74 integrate foodies cathering security ecosystem
```

Repositorio:

```text
https://github.com/EduSalazar0/Cathering-Foodies-Ecosistema
```

## 19. Conclusion

La integracion convierte dos aplicaciones separadas en un ecosistema seguro con identidad centralizada. Keycloak concentra autenticacion, autorizacion, SSO, OTP y usuarios federados. Cathering y Foodies se adaptaron para confiar en los tokens de Keycloak y para distribuir la experiencia segun roles de cada plataforma. Ademas, el flujo A hacia B se protege con cifrado mediante KMS, cumpliendo el requisito de comunicacion segura entre sistemas.

Con esto, el proyecto sirve para demostrar una arquitectura de software seguro completa: identidad federada, control de acceso, segundo factor, SSO, separacion de roles por sistema y comunicacion cifrada entre aplicaciones.
