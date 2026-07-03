using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

public static class FoodiesAuthenticationExtensions
{
    public static AuthenticationBuilder AddFoodiesAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JWT SecretKey is required");
        var keycloakAuthority = configuration["Keycloak:Authority"] ?? "http://localhost:8080/realms/proyecto-seguro";
        var keycloakMetadataAddress = configuration["Keycloak:MetadataAddress"];

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "FoodiesSmartBearer";
            options.DefaultChallengeScheme = "FoodiesSmartBearer";
        });

        authBuilder.AddPolicyScheme("FoodiesSmartBearer", "Foodies Smart Bearer", options =>
        {
            options.ForwardDefaultSelector = context =>
            {
                var token = ExtractBearerToken(context.Request.Headers.Authorization.ToString());
                if (string.IsNullOrWhiteSpace(token))
                {
                    return "LocalJwt";
                }

                try
                {
                    var issuer = new JwtSecurityTokenHandler().ReadJwtToken(token).Issuer;
                    return issuer.StartsWith(keycloakAuthority.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)
                        ? "Keycloak"
                        : "LocalJwt";
                }
                catch
                {
                    return "LocalJwt";
                }
            };
        });

        authBuilder.AddJwtBearer("LocalJwt", options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.Zero,
                RoleClaimType = ClaimTypes.Role
            };
        });

        authBuilder.AddJwtBearer("Keycloak", options =>
        {
            options.Authority = keycloakAuthority;
            if (!string.IsNullOrWhiteSpace(keycloakMetadataAddress))
            {
                options.MetadataAddress = keycloakMetadataAddress;
            }
            options.RequireHttpsMetadata = keycloakAuthority.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = keycloakAuthority,
                ValidateAudience = false,
                ValidateLifetime = true,
                NameClaimType = "preferred_username",
                RoleClaimType = ClaimTypes.Role
            };
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    AddKeycloakRoles(context.Principal);
                    return Task.CompletedTask;
                }
            };
        });

        return authBuilder;
    }

    private static string? ExtractBearerToken(string authorizationHeader)
    {
        const string prefix = "Bearer ";
        return authorizationHeader.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? authorizationHeader[prefix.Length..].Trim()
            : null;
    }

    private static void AddKeycloakRoles(ClaimsPrincipal? principal)
    {
        if (principal?.Identity is not ClaimsIdentity identity)
        {
            return;
        }

        foreach (var role in ExtractRealmRoles(principal).Concat(ExtractClientRoles(principal)))
        {
            AddRole(identity, principal, role);
        }
    }

    private static IEnumerable<string> ExtractRealmRoles(ClaimsPrincipal principal)
    {
        var realmAccess = principal.FindFirst("realm_access")?.Value;
        if (string.IsNullOrWhiteSpace(realmAccess))
        {
            return [];
        }

        using var document = JsonDocument.Parse(realmAccess);
        return ExtractRoles(document.RootElement).ToArray();
    }

    private static IEnumerable<string> ExtractClientRoles(ClaimsPrincipal principal)
    {
        var resourceAccess = principal.FindFirst("resource_access")?.Value;
        if (string.IsNullOrWhiteSpace(resourceAccess))
        {
            return [];
        }

        using var document = JsonDocument.Parse(resourceAccess);
        return document.RootElement.EnumerateObject()
            .SelectMany(client => ExtractRoles(client.Value))
            .ToArray();
    }

    private static IEnumerable<string> ExtractRoles(JsonElement element)
    {
        if (!element.TryGetProperty("roles", out var roles) || roles.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return roles.EnumerateArray()
            .Select(item => item.GetString())
            .Where(role => !string.IsNullOrWhiteSpace(role))!;
    }

    private static void AddRole(ClaimsIdentity identity, ClaimsPrincipal principal, string role)
    {
        AddRoleClaim(identity, principal, role);

        var canonicalRole = role switch
        {
            "foodies_admin" => "admin",
            "foodies_foodie" => "foodie",
            "foodies_restaurante" => "restaurante",
            _ => null
        };

        if (!string.IsNullOrWhiteSpace(canonicalRole))
        {
            AddRoleClaim(identity, principal, canonicalRole);
        }
    }

    private static void AddRoleClaim(ClaimsIdentity identity, ClaimsPrincipal principal, string role)
    {
        if (!principal.IsInRole(role))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }
    }
}
