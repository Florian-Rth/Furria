namespace Furria.Application.Gallery;

public sealed record PublicAlbumDetails
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required DateTimeOffset? EntryStartsAt { get; init; }

    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicGalleryPhoto> Photos { get; init; }
}
