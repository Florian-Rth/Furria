namespace Furria.Application.Club;

public sealed record AnnouncementAuthorReference
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? PortraitUrl { get; init; }

    public required string? OfficeName { get; init; }
}
