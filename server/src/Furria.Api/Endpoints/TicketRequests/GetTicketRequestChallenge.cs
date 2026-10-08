using FastEndpoints;
using Furria.Api.Altcha;
using Furria.Api.RateLimiting;

namespace Furria.Api.Endpoints.TicketRequests;

public sealed class GetTicketRequestChallenge
    : EndpointWithoutRequest<GetTicketRequestChallengeResponse>
{
    private readonly AltchaChallenges _altchaChallenges;

    public GetTicketRequestChallenge(AltchaChallenges altchaChallenges)
    {
        _altchaChallenges = altchaChallenges;
    }

    public override void Configure()
    {
        Get("ticket-requests/challenge");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(CancellationToken ct) =>
        await Send.OkAsync(ToResponse(_altchaChallenges.Issue()), cancellation: ct);

    private static GetTicketRequestChallengeResponse ToResponse(AltchaChallenge challenge) =>
        new()
        {
            Parameters = new TicketRequestAltchaParametersDto
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

public sealed record GetTicketRequestChallengeResponse
{
    public required TicketRequestAltchaParametersDto Parameters { get; init; }

    public required string Signature { get; init; }
}

public sealed record TicketRequestAltchaParametersDto
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
