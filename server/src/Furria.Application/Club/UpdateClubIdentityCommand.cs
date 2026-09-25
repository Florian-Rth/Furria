namespace Furria.Application.Club;

public sealed record UpdateClubIdentityCommand
{
    public required string? Name { get; init; }

    public required string? ShortName { get; init; }

    public required int? FoundedYear { get; init; }
}
