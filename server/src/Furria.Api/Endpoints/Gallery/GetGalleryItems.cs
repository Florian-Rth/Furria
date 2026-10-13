using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryItems : Endpoint<GetGalleryItemsRequest, GetGalleryItemsResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGalleryItems(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/items");
        Definition.RequireAnyPermission(GalleryKeys.Viewers);
    }

    public override async Task HandleAsync(GetGalleryItemsRequest req, CancellationToken ct)
    {
        var items = await _galleryService.GetItemsAsync(req.Ids, User.AccountId()!.Value, ct);

        await Send.OkAsync(
            new GetGalleryItemsResponse { Items = [.. items.Select(ToDto)] },
            cancellation: ct
        );
    }

    private GetGalleryItemsItemDto ToDto(GalleryItemSummary item) =>
        new()
        {
            MediaItemId = item.MediaItemId,
            Kind = item.Kind,
            State = item.State,
            IsStalled = item.IsStalled,
            Width = item.Width,
            Height = item.Height,
            DurationSeconds = item.DurationSeconds,
            CapturedAt = item.CapturedAt,
            UploadedAt = item.UploadedAt,
            Camera = item.Camera,
            OriginalFileName = item.OriginalFileName,
            Urls = GalleryMediaUrls.Of(_signer, item.MediaItemId, item.Kind, item.RenderedAt),
        };
}

public sealed record GetGalleryItemsRequest
{
    [QueryParam]
    public int[] Ids { get; init; } = [];
}

public sealed class GetGalleryItemsValidator : Validator<GetGalleryItemsRequest>
{
    public const int MaxIds = 200;

    public GetGalleryItemsValidator()
    {
        RuleFor(request => request.Ids).NotEmpty().Must(ids => ids.Length <= MaxIds);
        RuleForEach(request => request.Ids).GreaterThan(0);
    }
}

public sealed record GetGalleryItemsResponse
{
    public required IReadOnlyList<GetGalleryItemsItemDto> Items { get; init; }
}

public sealed record GetGalleryItemsItemDto
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required bool IsStalled { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required double? DurationSeconds { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required DateTimeOffset UploadedAt { get; init; }

    public required string? Camera { get; init; }

    public required string OriginalFileName { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
