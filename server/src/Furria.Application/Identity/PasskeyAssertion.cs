namespace Furria.Application.Identity;

public sealed record PasskeyAssertion
{
    public required string ChallengeId { get; init; }

    public required string CredentialJson { get; init; }
}
