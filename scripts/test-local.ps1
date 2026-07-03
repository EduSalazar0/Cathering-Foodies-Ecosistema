$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $PSScriptRoot

function Check-Url {
    param(
        [string]$Url,
        [int[]]$Expected
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        $code = [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        } else {
            Write-Host "FAIL $Url :: $($_.Exception.Message)"
            return $false
        }
    }

    if ($Expected -contains $code) {
        Write-Host "OK $code $Url"
        return $true
    }

    Write-Host "FAIL $code $Url esperado: $($Expected -join ',')"
    return $false
}

$ok = $true
$ok = (Check-Url "http://localhost:8080/realms/proyecto-seguro/.well-known/openid-configuration" @(200)) -and $ok
$ok = (Check-Url "http://localhost:4566/_localstack/health" @(200)) -and $ok
$ok = (Check-Url "http://localhost:5174" @(200)) -and $ok
$ok = (Check-Url "http://localhost:4200" @(200)) -and $ok
$ok = (Check-Url "http://localhost:3000/api/products" @(401)) -and $ok
$ok = (Check-Url "http://localhost:5111/api/users" @(401)) -and $ok
$ok = (Check-Url "http://localhost:5001/api/users" @(401)) -and $ok
$ok = (Check-Url "http://localhost:5003/api/formulariofoodie" @(401)) -and $ok
$ok = (Check-Url "http://localhost:5004/api/integration/cathering" @(405)) -and $ok
$ok = (Check-Url "http://localhost:5005/api/roles" @(401)) -and $ok

Push-Location $Root
docker exec keycloak_server /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password AdminSecurePassword2026 | Out-Null
$otp = docker exec keycloak_server /opt/keycloak/bin/kcadm.sh get authentication/required-actions/CONFIGURE_TOTP -r proyecto-seguro
if ($otp -match '"enabled" : true' -and $otp -match '"defaultAction" : true') {
    Write-Host "OK Keycloak OTP CONFIGURE_TOTP activo"
} else {
    Write-Host "FAIL Keycloak OTP no esta activo como defaultAction"
    $ok = $false
}

$tempUser = "smoke_api_test"
$existing = docker exec keycloak_server /opt/keycloak/bin/kcadm.sh get users -r proyecto-seguro -q username=$tempUser --fields id,username
if ($existing -notmatch $tempUser) {
    docker exec keycloak_server /opt/keycloak/bin/kcadm.sh create users -r proyecto-seguro -s username=$tempUser -s enabled=true -s email=smoke_api_test@example.local -s emailVerified=true -s firstName=Smoke -s lastName=Api -s requiredActions=[] | Out-Null
    docker exec keycloak_server /opt/keycloak/bin/kcadm.sh set-password -r proyecto-seguro --username $tempUser --new-password Smoke123! | Out-Null
}

$createdUser = docker exec keycloak_server /opt/keycloak/bin/kcadm.sh get users -r proyecto-seguro -q username=$tempUser --fields id | ConvertFrom-Json
if ($createdUser.Count -gt 0) {
    docker exec keycloak_server /opt/keycloak/bin/kcadm.sh update users/$($createdUser[0].id) -r proyecto-seguro -s firstName=Smoke -s lastName=Api -s emailVerified=true -s requiredActions=[] | Out-Null
}

try {
    $tokenResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/realms/proyecto-seguro/protocol/openid-connect/token" -Body @{
        client_id = "foodies-angular"
        grant_type = "password"
        username = $tempUser
        password = "Smoke123!"
        scope = "openid profile email"
    } -ContentType "application/x-www-form-urlencoded" -TimeoutSec 10

    $payload = @{ smoke = "from-cathering-gateway"; createdAt = (Get-Date).ToUniversalTime().ToString("o") } | ConvertTo-Json
    $sync = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/orders/sync-foodies" -Headers @{
        Authorization = "Bearer $($tokenResponse.access_token)"
    } -Body $payload -ContentType "application/json" -TimeoutSec 30

    if ($sync.message -match "Trama cifrada enviada" -and $sync.foodiesResponse.message -match "desencriptada con KMS") {
        Write-Host "OK Cathering -> Foodies con trama cifrada KMS"
    } else {
        Write-Host "FAIL respuesta inesperada en integracion A->B"
        $ok = $false
    }
} catch {
    Write-Host "FAIL integracion A->B :: $($_.Exception.Message)"
    $ok = $false
} finally {
    $userInfo = docker exec keycloak_server /opt/keycloak/bin/kcadm.sh get users -r proyecto-seguro -q username=$tempUser --fields id | ConvertFrom-Json
    if ($userInfo.Count -gt 0) {
        docker exec keycloak_server /opt/keycloak/bin/kcadm.sh delete users/$($userInfo[0].id) -r proyecto-seguro | Out-Null
    }
}
Pop-Location

if ($ok) {
    Write-Host ""
    Write-Host "TODAS LAS PRUEBAS LOCALES PASARON."
    exit 0
}

Write-Host ""
Write-Host "HAY PRUEBAS FALLIDAS. Revisa .runtime-logs y docker logs."
exit 1
