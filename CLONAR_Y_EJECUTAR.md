# Clonar y ejecutar en otra computadora

Este repo queda preparado para una maquina local de demostracion, no para produccion.

## Requisitos

- Windows con PowerShell.
- Git.
- Docker Desktop encendido.
- Node.js 20 o superior.
- .NET SDK 9.

## Pasos

```powershell
git clone https://github.com/EduSalazar0/Cathering-Foodies-Ecosistema.git
cd Cathering-Foodies-Ecosistema
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\start-local.ps1
```

Cuando termine, abrir:

- Keycloak: `http://localhost:8080`
- Cathering: `http://localhost:5174`
- Foodies: `http://localhost:4200`
- Gateway Foodies: `http://localhost:5111`

## Validar que todo funciona

```powershell
.\scripts\test-local.ps1
```

La prueba valida:

- Keycloak activo.
- LocalStack/KMS activo.
- Cathering activo.
- Foodies activo.
- APIs protegidas con `401` sin token.
- OTP activo en Keycloak.
- Comunicacion Cathering -> Foodies con trama cifrada y descifrada por KMS.

## Detener todo

```powershell
.\scripts\stop-local.ps1
```

## Usuarios demo

- `admin` / `Admin123!`
- `foodie` / `Foodie123!`
- `restaurante` / `Restaurante123!`
- `estudiante` / `Estudiante123!`
- `cafeteria` / `Cafeteria123!`
- `personal` / `Personal123!`

Todos los usuarios demo tienen OTP obligatorio. En el primer ingreso Keycloak muestra el QR para configurar una app movil como Google Authenticator o Microsoft Authenticator.

## Notas importantes

- Los archivos necesarios de configuracion ya estan versionados.
- `local.env.example` contiene los puertos y variables usadas como referencia.
- Keycloak importa el realm desde `keycloak-data/proyecto-seguro-realm.json`.
- El Gateway en desarrollo apunta a APIs locales mediante `FoodiesBackWEB/GatewayApi/appsettings.Development.json`.
- Cathering envia la integracion cifrada a `http://host.docker.internal:5004/api/integration/cathering`.
- Los logs locales se generan en `.runtime-logs/` y no se suben a GitHub.
