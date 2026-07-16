using System.Reflection;
using FastEndpoints;

namespace Furria.Api.Endpoints;

public sealed class GetHealth : EndpointWithoutRequest<GetHealthResponse>
{
    private static readonly string InformationalVersion =
        typeof(GetHealth)
            .Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion
        ?? "unknown";

    public override void Configure()
    {
        Get("health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var response = new GetHealthResponse { Status = "ok", Version = InformationalVersion };
        await Send.OkAsync(response, cancellation: ct);
    }
}

public sealed record GetHealthResponse
{
    public required string Status { get; init; }

    public required string Version { get; init; }
}
