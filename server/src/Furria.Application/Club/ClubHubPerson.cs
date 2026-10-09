using Furria.Application.Media;

namespace Furria.Application.Club;

public sealed record ClubHubPerson
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDetails? Portrait { get; init; }

    public required string? OfficeName { get; init; }
}
