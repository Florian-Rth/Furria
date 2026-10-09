using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGallery : EndpointWithoutRequest<GetGalleryResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGallery(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery");
        Definition.RequireAnyPermission(GalleryKeys.Viewers);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var sections = await _galleryService.GetHubAsync(ct);

        await Send.OkAsync(
            new GetGalleryResponse { Sections = [.. sections.Select(ToDto)] },
            cancellation: ct
        );
    }

    private GetGallerySectionDto ToDto(GallerySection section) =>
        new()
        {
            SessionStartYear = section.SessionStartYear,
            SessionNumber = section.SessionNumber,
            Albums = [.. section.Albums.Select(ToDto)],
        };

    private GetGalleryAlbumDto ToDto(AlbumSummary album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            EntryStartsAt = album.EntryStartsAt,
            SessionStartYear = album.SessionStartYear,
            IsPublished = album.IsPublished,
            Photos = album.Photos,
            Videos = album.Videos,
            SelectionCount = album.SelectionCount,
            CreatedAt = album.CreatedAt,
            Cover = album.Cover is null ? null : ToDto(album.Cover),
            Samples = [.. album.Samples.Select(ToDto)],
        };

    private GetGalleryMediaDto ToDto(GalleryMediaRef media) =>
        new()
        {
            MediaItemId = media.MediaItemId,
            Kind = media.Kind,
            State = media.State,
            Width = media.Width,
            Height = media.Height,
            CapturedAt = media.CapturedAt,
            Urls = GalleryMediaUrls.Of(_signer, media.MediaItemId, media.Kind),
        };
}

public sealed record GetGalleryResponse
{
    public required IReadOnlyList<GetGallerySectionDto> Sections { get; init; }
}

public sealed record GetGallerySectionDto
{
    public required int? SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<GetGalleryAlbumDto> Albums { get; init; }
}

public sealed record GetGalleryAlbumDto
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

    public required GetGalleryMediaDto? Cover { get; init; }

    public required IReadOnlyList<GetGalleryMediaDto> Samples { get; init; }
}

public sealed record GetGalleryMediaDto
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
