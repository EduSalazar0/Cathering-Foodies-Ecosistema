using System.Text.Json;
using Amazon.KeyManagementService;
using Amazon.KeyManagementService.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReservasApi.Controllers;

[ApiController]
[Route("api/integration")]
[Authorize]
public class IntegrationController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public IntegrationController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("cathering")]
    public async Task<IActionResult> ReceiveCatheringEnvelope([FromBody] CatheringEnvelopeRequest request)
    {
        if (request.EncryptedPayload is null || request.EncryptedPayload.TrimStart().StartsWith("{"))
        {
            return BadRequest(new { error = "La integracion solo acepta tramas cifradas por KMS" });
        }

        var json = await DecryptPayloadAsync(request.EncryptedPayload);
        using var document = JsonDocument.Parse(json);
        var payload = document.RootElement.Clone();

        return Ok(new
        {
            message = "Trama cifrada A->B recibida y desencriptada con KMS",
            receivedAt = DateTimeOffset.UtcNow,
            source = request.IntegrationHeader?.SourceSystem,
            target = request.IntegrationHeader?.TargetSystem,
            subject = payload.TryGetProperty("sub", out var sub) ? sub.GetString() : null,
            actionType = payload.TryGetProperty("actionType", out var action) ? action.GetString() : null,
            payload
        });
    }

    private async Task<string> DecryptPayloadAsync(string encryptedPayload)
    {
        var serviceUrl = _configuration["Kms:ServiceUrl"] ?? "http://localhost:4566";
        var region = _configuration["Kms:Region"] ?? "us-east-1";

        using var client = new AmazonKeyManagementServiceClient(
            "test",
            "test",
            new AmazonKeyManagementServiceConfig
            {
                ServiceURL = serviceUrl,
                AuthenticationRegion = region
            });

        var response = await client.DecryptAsync(new DecryptRequest
        {
            CiphertextBlob = new MemoryStream(Convert.FromBase64String(encryptedPayload))
        });

        using var reader = new StreamReader(response.Plaintext);
        return await reader.ReadToEndAsync();
    }
}

public class CatheringEnvelopeRequest
{
    public IntegrationHeader? IntegrationHeader { get; set; }
    public string? EncryptedPayload { get; set; }
}

public class IntegrationHeader
{
    public string? SourceSystem { get; set; }
    public string? TargetSystem { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
    public string? KmsAlias { get; set; }
}
