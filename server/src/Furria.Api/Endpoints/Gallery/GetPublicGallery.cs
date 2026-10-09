using FastEndpoints;
using Furria.Application.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetPublicGallery : EndpointWithoutRequest<GetPublicGalleryResponse>
{
    private readonly GalleryService _galleryService;

    public GetPublicGallery(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Get("public/gallery");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var sections = await _galleryService.GetPublicGalleryAsync(ct);

        await Send.OkAsync(ToResponse(sections), cancellation: ct);
    }

    private static GetPublicGalleryResponse ToResponse(
        IReadOnlyList<PublicGallerySection> sections
    ) => new() { Sessions = [.. sections.Select(ToDto)] };

    private static PublicGallerySessionDto ToDto(PublicGallerySection section) =>
        new()
        {
            SessionStartYear = section.SessionStartYear,
            SessionNumber = section.SessionNumber,
            Albums = [.. section.Albums.Select(ToDto)],
        };

    private static PublicAlbumSummaryDto ToDto(PublicAlbumSummary album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            EntryStartsAt = album.EntryStartsAt,
            PhotoCount = album.PhotoCount,
            Cover = ToDto(album.Cover),
        };

    private static PublicAlbumCoverDto ToDto(PublicGalleryPhoto cover) =>
        new()
        {
            MediaItemId = cover.MediaItemId,
            Width = cover.Width,
            Height = cover.Height,
            SmallUrl = cover.Picture.SmallUrl,
            MediumUrl = cover.Picture.MediumUrl,
            LargeUrl = cover.Picture.LargeUrl,
        };
}

public sealed record GetPublicGalleryResponse
{
    public required IReadOnlyList<PublicGallerySessionDto> Sessions { get; init; }
}

public sealed record PublicGallerySessionDto
{
    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicAlbumSummaryDto> Albums { get; init; }
}

public sealed record PublicAlbumSummaryDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset? EntryStartsAt { get; init; }

    public required int PhotoCount { get; init; }

    public required PublicAlbumCoverDto Cover { get; init; }
}

public sealed record PublicAlbumCoverDto
{
    public required int MediaItemId { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }
}
