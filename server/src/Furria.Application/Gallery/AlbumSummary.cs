namespace Furria.Application.Gallery;

public sealed record AlbumSummary
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset? EntryStartsAt { get; init; }

    public required int? SessionStartYear { get; init; }

    public required bool IsPublished { get; init; }

    public required int Photos { get; init; }

    public required int Videos { get; init; }

    public required int SelectionCount { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required GalleryMediaRef? Cover { get; init; }

    public required IReadOnlyList<GalleryMediaRef> Samples { get; init; }
}
