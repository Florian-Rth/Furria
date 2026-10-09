namespace Furria.Application.Gallery;

public sealed record PublicAlbumSummary
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset? EntryStartsAt { get; init; }

    public required int PhotoCount { get; init; }

    public required PublicGalleryPhoto Cover { get; init; }
}
