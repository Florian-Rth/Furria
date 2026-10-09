namespace Furria.Application.Gallery;

public sealed record CreateAlbumCommand
{
    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required int? CalendarEntryId { get; init; }

    public required int? SessionStartYear { get; init; }
}
