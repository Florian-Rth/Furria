using FastEndpoints;
using Furria.Api.Altcha;
using Furria.Api.RateLimiting;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class GetMembershipApplicationChallenge
    : EndpointWithoutRequest<GetMembershipApplicationChallengeResponse>
{
    private readonly AltchaChallenges _altchaChallenges;

    public GetMembershipApplicationChallenge(AltchaChallenges altchaChallenges)
    {
        _altchaChallenges = altchaChallenges;
    }

    public override void Configure()
    {
        Get("membership-applications/challenge");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(CancellationToken ct) =>
        await Send.OkAsync(ToResponse(_altchaChallenges.Issue()), cancellation: ct);

    private static GetMembershipApplicationChallengeResponse ToResponse(
        AltchaChallenge challenge
    ) =>
        new()
        {
            Parameters = new AltchaChallengeParametersDto
            {
                Algorithm = challenge.Parameters.Algorithm,
                Cost = challenge.Parameters.Cost,
                ExpiresAt = challenge.Parameters.ExpiresAt,
                KeyLength = challenge.Parameters.KeyLength,
                KeyPrefix = challenge.Parameters.KeyPrefix,
                KeySignature = challenge.Parameters.KeySignature,
                Nonce = challenge.Parameters.Nonce,
                Salt = challenge.Parameters.Salt,
            },
            Signature = challenge.Signature,
        };
}

public sealed record GetMembershipApplicationChallengeResponse
{
    public required AltchaChallengeParametersDto Parameters { get; init; }

    public required string Signature { get; init; }
}

public sealed record AltchaChallengeParametersDto
{
    public required string Algorithm { get; init; }

    public required int Cost { get; init; }

    public required long ExpiresAt { get; init; }

    public required int KeyLength { get; init; }

    public required string KeyPrefix { get; init; }

    public required string KeySignature { get; init; }

    public required string Nonce { get; init; }

    public required string Salt { get; init; }
}
