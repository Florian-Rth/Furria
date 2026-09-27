namespace Furria.Application.Club;

public sealed record UpdateClubContactCommand
{
    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? WebsiteUrl { get; init; }

    public required string? InstagramUrl { get; init; }

    public required string? FacebookUrl { get; init; }
}
