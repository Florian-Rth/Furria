using System.Text.Json;
using FastEndpoints;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PostPasskeyRequestOptions
    : EndpointWithoutRequest<PostPasskeyRequestOptionsResponse>
{
    private readonly PasskeyService _passkeyService;

    public PostPasskeyRequestOptions(PasskeyService passkeyService)
    {
        _passkeyService = passkeyService;
    }

    public override void Configure()
    {
        Post("auth/passkeys/request-options");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var requested = await _passkeyService.MakeRequestOptionsAsync(ct);
        await Send.OkAsync(ToResponse(requested), cancellation: ct);
    }

    private static PostPasskeyRequestOptionsResponse ToResponse(PasskeyOptionsDetails options) =>
        new()
        {
            ChallengeId = options.ChallengeId,
            Options = PasskeyCeremonyLimits.OptionsOf(options.OptionsJson),
        };
}

public sealed record PostPasskeyRequestOptionsResponse
{
    public required string ChallengeId { get; init; }

    public required JsonElement Options { get; init; }
}
