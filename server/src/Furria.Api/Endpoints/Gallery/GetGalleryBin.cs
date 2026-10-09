using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryBin : EndpointWithoutRequest<GetGalleryBinResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGalleryBin(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/bin");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var bin = await _galleryService.GetBinAsync(ct);

        await Send.OkAsync(
            new GetGalleryBinResponse
            {
                Albums = [.. bin.Albums.Select(ToDto)],
                Items = [.. bin.Items.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    private GetGalleryBinAlbumDto ToDto(BinnedAlbumSummary album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            ItemCount = album.ItemCount,
            Cover = album.Cover is null ? null : ToDto(album.Cover),
            BinnedAt = album.BinnedAt,
            PurgesAt = album.PurgesAt,
        };

    private GetGalleryBinItemDto ToDto(BinnedItemSummary item) =>
        new()
        {
            Item = ToDto(item.Item),
            OriginalFileName = item.OriginalFileName,
            AlbumId = item.AlbumId,
            AlbumTitle = item.AlbumTitle,
            BinnedAt = item.BinnedAt,
            PurgesAt = item.PurgesAt,
        };

    private GetGalleryBinMediaDto ToDto(GalleryMediaRef media) =>
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

public sealed record GetGalleryBinResponse
{
    public required IReadOnlyList<GetGalleryBinAlbumDto> Albums { get; init; }

    public required IReadOnlyList<GetGalleryBinItemDto> Items { get; init; }
}

public sealed record GetGalleryBinAlbumDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required int ItemCount { get; init; }

    public required GetGalleryBinMediaDto? Cover { get; init; }

    public required DateTimeOffset BinnedAt { get; init; }

    public required DateTimeOffset PurgesAt { get; init; }
}

public sealed record GetGalleryBinItemDto
{
    public required GetGalleryBinMediaDto Item { get; init; }

    public required string OriginalFileName { get; init; }

    public required int AlbumId { get; init; }

    public required string AlbumTitle { get; init; }

    public required DateTimeOffset BinnedAt { get; init; }

    public required DateTimeOffset PurgesAt { get; init; }
}

public sealed record GetGalleryBinMediaDto
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
