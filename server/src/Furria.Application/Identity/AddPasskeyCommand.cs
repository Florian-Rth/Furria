namespace Furria.Application.Identity;

public sealed record AddPasskeyCommand
{
    public required int AccountId { get; init; }

    public required string ChallengeId { get; init; }

    public required string CredentialJson { get; init; }

    public required string? Name { get; init; }
}
