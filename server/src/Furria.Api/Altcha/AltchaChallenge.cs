namespace Furria.Api.Altcha;

public sealed record AltchaChallenge
{
    public required AltchaChallengeParameters Parameters { get; init; }

    public required string Signature { get; init; }
}
