$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Logs = Join-Path $Root ".runtime-logs"
New-Item -ItemType Directory -Force -Path $Logs | Out-Null

function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Wait-Http {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 90
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    throw "No respondio a tiempo: $Url"
}

function Start-DotnetApi {
    param(
        [string]$Name,
        [string]$Project,
        [int]$Port
    )

    if (Test-Port $Port) {
        Write-Host "$Name ya esta escuchando en $Port"
        return
    }

    $projectPath = Join-Path $Root $Project
    $logPath = Join-Path $Logs "$Name.log"
    $command = "set ASPNETCORE_ENVIRONMENT=Development&& dotnet run --project `"$projectPath`" --no-launch-profile --urls `"http://localhost:$Port`" > `"$logPath`" 2>&1"
    Start-Process -WindowStyle Hidden cmd -ArgumentList "/c", $command
    Write-Host "Iniciando $Name en http://localhost:$Port"
}

Write-Host "Levantando infraestructura Keycloak + LocalStack..."
Push-Location $Root
docker compose up -d
Pop-Location

Wait-Http "http://localhost:8080/realms/proyecto-seguro/.well-known/openid-configuration" 120
Wait-Http "http://localhost:4566/_localstack/health" 120

Write-Host "Levantando Cathering..."
Push-Location (Join-Path $Root "Cathering3")
docker compose up -d --build
Pop-Location

Write-Host "Levantando APIs Foodies..."
Start-DotnetApi "usersapi" "FoodiesBackWEB\UsersApi\UsersApi.csproj" 5001
Start-DotnetApi "formulariofoodieapi" "FoodiesBackWEB\FormularioFoodieApi\FormularioFoodieApi.csproj" 5003
Start-DotnetApi "reservasapi" "FoodiesBackWEB\ReservasApi\ReservasApi.csproj" 5004
Start-DotnetApi "admincoreapi" "FoodiesBackWEB\AdminCoreApi\AdminCoreApi.csproj" 5005
Start-DotnetApi "gatewayapi" "FoodiesBackWEB\GatewayApi\GatewayApi.csproj" 5111

Write-Host "Levantando Foodies frontend..."
$foodiesFront = Join-Path $Root "FoodiesFrontWEB"
if (-not (Test-Path (Join-Path $foodiesFront "node_modules"))) {
    Push-Location $foodiesFront
    npm install
    Pop-Location
}

if (-not (Test-Port 4200)) {
    $frontLog = Join-Path $Logs "foodies-front.log"
    $frontCommand = "cd /d `"$foodiesFront`" && npx ng serve --host localhost --port 4200 > `"$frontLog`" 2>&1"
    Start-Process -WindowStyle Hidden cmd -ArgumentList "/c", $frontCommand
    Write-Host "Iniciando FoodiesFrontWEB en http://localhost:4200"
} else {
    Write-Host "FoodiesFrontWEB ya esta escuchando en 4200"
}

Write-Host ""
Write-Host "Listo. URLs principales:"
Write-Host "  Keycloak:  http://localhost:8080"
Write-Host "  Cathering: http://localhost:5174"
Write-Host "  Foodies:   http://localhost:4200"
Write-Host "  Gateway:   http://localhost:5111"
Write-Host ""
Write-Host "Logs locales: $Logs"
Write-Host "Para validar todo: .\scripts\test-local.ps1"
