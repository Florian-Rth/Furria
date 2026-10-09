using Furria.Application.Media;

namespace Furria.Application.Start;

public sealed record StartPerson
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDetails? Portrait { get; init; }

    public required string? OfficeName { get; init; }
}
