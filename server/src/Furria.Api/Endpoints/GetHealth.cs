using System.Reflection;
using FastEndpoints;
using Furria.Infrastructure.Persistence;

namespace Furria.Api.Endpoints;

public sealed class GetHealth : EndpointWithoutRequest<GetHealthResponse>
{
    private static readonly string InformationalVersion =
        typeof(GetHealth)
            .Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion
        ?? "unknown";

    private static readonly GetHealthResponse Ready = new()
    {
        Status = "ok",
        Version = InformationalVersion,
    };

    private static readonly GetHealthResponse Unavailable = new()
    {
        Status = "unavailable",
        Version = InformationalVersion,
    };

    private readonly DatabaseHealthService _databaseHealthService;

    public GetHealth(DatabaseHealthService databaseHealthService)
    {
        _databaseHealthService = databaseHealthService;
    }

    public override void Configure()
    {
        Get("health");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (await _databaseHealthService.IsReadyAsync(ct))
            await Send.OkAsync(Ready, cancellation: ct);
        else
            await Send.ResponseAsync(Unavailable, StatusCodes.Status503ServiceUnavailable, ct);
    }
}

public sealed record GetHealthResponse
{
    public required string Status { get; init; }

    public required string Version { get; init; }
}
