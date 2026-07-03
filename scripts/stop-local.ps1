$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Deteniendo frontends/APIs .NET locales..."
Get-Process UsersApi,FormularioFoodieApi,ReservasApi,AdminCoreApi,GatewayApi,node -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Path -like "$Root*" -or $_.ProcessName -eq "node"
    } |
    Stop-Process -Force

Write-Host "Deteniendo Cathering..."
Push-Location (Join-Path $Root "Cathering3")
docker compose down
Pop-Location

Write-Host "Deteniendo infraestructura Keycloak + LocalStack..."
Push-Location $Root
docker compose down
Pop-Location

Write-Host "Listo."
