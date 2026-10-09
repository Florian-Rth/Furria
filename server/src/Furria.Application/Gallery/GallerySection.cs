namespace Furria.Application.Gallery;

public sealed record GallerySection
{
    public required int? SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<AlbumSummary> Albums { get; init; }
}
