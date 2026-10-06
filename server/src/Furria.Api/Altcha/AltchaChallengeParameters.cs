namespace Furria.Api.Altcha;

public sealed record AltchaChallengeParameters
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
