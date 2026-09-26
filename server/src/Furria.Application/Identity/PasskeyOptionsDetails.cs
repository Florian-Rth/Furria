namespace Furria.Application.Identity;

public sealed record PasskeyOptionsDetails
{
    public required string ChallengeId { get; init; }

    public required string OptionsJson { get; init; }
}
