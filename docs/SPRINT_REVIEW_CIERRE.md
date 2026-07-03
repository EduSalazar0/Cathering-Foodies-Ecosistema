# Sprint Review - Proyecto Integrador Seguro

## Objetivo del proyecto

Integrar el Sistema A (Cathering React + Node.js) con el Sistema B (Foodies Angular + .NET 9) usando Keycloak como control central de identidades y LocalStack/AWS KMS como servicio externo para cifrar la comunicacion A hacia B.

## Roadmap del proyecto

| Fase | Alcance | Resultado |
| --- | --- | --- |
| Fase 1 | Infraestructura de confianza | Keycloak, PostgreSQL y LocalStack definidos en Docker Compose. Realm `proyecto-seguro` importable con clientes, roles y usuarios demo. |
| Fase 2 | Identidad federada | Foodies Angular autentica con Authorization Code + PKCE contra Keycloak. Cathering React ya usa OIDC contra el mismo realm. |
| Fase 3 | Autorizacion por roles | APIs .NET aceptan JWT de Keycloak y extraen `realm_access.roles` para politicas `AdminOnly`. |
| Fase 4 | Comunicacion cifrada | Cathering cifra una trama con KMS y Foodies la recibe/desencripta en `/api/integration/cathering`. |
| Fase 5 | Cierre y verificacion | Builds .NET correctos, build Angular development correcto y evidencia de bloqueo Docker cuando Docker Desktop no esta iniciado. |

## Puntos del apartado 1

| Rubrica | Implementacion |
| --- | --- |
| Autenticacion | Keycloak emite tokens OIDC RS256 para `cathering-react` y `foodies-angular`. |
| Autorizacion | Roles centralizados `admin`, `foodie`, `restaurante`, `estudiante`, `cafeteria`, `personal_academico`. `POST /api/users/{id}/roles` exige `AdminOnly`. |
| SSO | Ambas SPAs usan el realm `proyecto-seguro`; la cookie de Keycloak permite entrar a Cathering y Foodies con la misma sesion. |
| 2FA | El realm obliga `CONFIGURE_TOTP` como accion requerida por defecto; los usuarios demo deben configurar OTP en app movil al primer login. |
| Federacion de usuarios | El identificador maestro es el claim `sub` de Keycloak. Foodies Angular guarda `id` como UUID y Cathering usa `req.user.sub`. |
| Trama encriptada A->B | `POST /api/orders/sync-foodies` cifra con KMS en Node y envia a Foodies; `POST /api/integration/cathering` desencripta con KMS en .NET y rechaza texto plano. |

## Auditoria de codigo / analisis estatico

Verificaciones ejecutadas:

- `docker compose up -d` en `Cathering-Foodies-Ecosistema`: correcto. Contenedores `keycloak_server`, `postgres_cloak` y `localstack_aws` arriba.
- `docker compose up -d` en `Cathering-Foodies-Ecosistema/Cathering3`: correcto. Contenedores `cathering3-frontend-1`, `cathering3-api-gateway-1`, `cathering3-auth-service-1`, `cathering3-catalog-service-1` y `cathering3-order-service-1` arriba.
- Frontend Sistema A: `http://localhost:5173` respondio `200`.
- Gateway Sistema A: contenedor arriba en `http://localhost:3000`; la ruta raiz responde `404` porque no existe endpoint raiz, pero el log confirma recepcion de peticiones.
- Health check LocalStack: `kms` disponible en `http://localhost:4566/_localstack/health`.
- Realm Keycloak: `http://localhost:8080/realms/proyecto-seguro/.well-known/openid-configuration` respondio `200`; log indica `Realm 'proyecto-seguro' imported`.
- Smoke test KMS: `order-service` cifro y descifro un payload JSON con LocalStack KMS; `encryptedLength=220` y `actionType=SMOKE_KMS_AFTER_FIX`.
- `dotnet build FoodiesBackWEB/GatewayApi/GatewayApi.csproj`: correcto, 0 errores.
- `dotnet build FoodiesBackWEB/UsersApi/UsersApi.csproj`: correcto, 0 errores.
- `dotnet build FoodiesBackWEB/ReservasApi/ReservasApi.csproj`: correcto, 0 errores.
- `dotnet build FoodiesBackWEB/AdminCoreApi/AdminCoreApi.csproj`: correcto, 0 errores.
- `dotnet build FoodiesBackWEB/FormularioFoodieApi/FormularioFoodieApi.csproj`: correcto, 0 errores.
- `npx ng build --configuration development`: correcto, 18 rutas prerenderizadas.
- `node --check` en controlador, rutas y servicio KMS de `order-service`: correcto.
- `dotnet list package --vulnerable --include-transitive`: sin paquetes vulnerables en GatewayApi, UsersApi, ReservasApi, AdminCoreApi y FormularioFoodieApi.
- `npm audit fix` aplicado en `FoodiesFrontWEB`: redujo la auditoria a 4 vulnerabilidades bajas residuales.
- `npm audit fix` aplicado en `order-service`: redujo la auditoria a 9 vulnerabilidades residuales; las restantes requieren `npm audit fix --force` con cambios rompientes en `sqlite3`/`sequelize`.

Brechas mitigadas:

- Se elimino `AllowAnonymous` de asignacion de roles.
- Los backends .NET validan tokens firmados por Keycloak y conservan compatibilidad con JWT legado.
- La ruta A->B rechaza payloads legibles y requiere KMS para recuperar el contenido.
- Las dependencias Angular se actualizaron dentro de la rama 20 para mitigar alertas altas/criticas reportadas por `npm audit`.

Entregable de presentacion:

- `docs/SPRINT_REVIEW_SEGURIDAD.pptx`: presentacion editable de 8 diapositivas con objetivo, roadmap, puntos de identidad, KMS, auditoria, etica y cierre.

## Analisis de etica algoritmica y discriminacion

La solucion no toma decisiones automatizadas sobre usuarios; aplica reglas explicitas de identidad, roles y seguridad. Para reducir riesgo de discriminacion operativa, los roles se administran de forma auditable en Keycloak y se recomienda revisar periodicamente asignaciones privilegiadas (`admin`, `cafeteria`, `restaurante`). Los datos sensibles sincronizados entre sistemas deben limitarse al minimo necesario y viajar cifrados mediante KMS.

## Conclusiones y cierre

El incremento deja una arquitectura funcional para demostrar autenticacion centralizada, SSO, MFA/OTP, autorizacion por roles, federacion por `sub` y comunicacion cifrada con KMS. En la verificacion local del 2026-06-29, Docker quedo activo con Keycloak, LocalStack y el Sistema A Cathering; el realm importo correctamente y el smoke test de KMS cifro/descifro datos.
