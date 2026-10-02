namespace Furria.Application.Club;

public sealed record PublicClubDetails
{
    public required string? Name { get; init; }

    public required int? FoundedYear { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? InstagramUrl { get; init; }

    public required string? FacebookUrl { get; init; }

    public required int MemberCount { get; init; }

    public required int GroupCount { get; init; }

    public required PublicClubSession Session { get; init; }
}
