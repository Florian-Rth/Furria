namespace Furria.Application.Gallery;

public sealed record AlbumDetails
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required AlbumEntry? CalendarEntry { get; init; }

    public required int? SessionStartYear { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required int? CoverMediaItemId { get; init; }

    public required int? ChosenCoverMediaItemId { get; init; }

    public required int Photos { get; init; }

    public required int Videos { get; init; }

    public required IReadOnlyList<AlbumUploaderCount> Uploaders { get; init; }

    public required IReadOnlyList<GalleryItemSummary> Items { get; init; }
}
