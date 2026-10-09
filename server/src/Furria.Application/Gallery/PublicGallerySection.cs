namespace Furria.Application.Gallery;

public sealed record PublicGallerySection
{
    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicAlbumSummary> Albums { get; init; }
}
