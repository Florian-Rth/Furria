using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetUploadLinkInbox
    : Endpoint<GetUploadLinkInboxRequest, GetUploadLinkInboxResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetUploadLinkInbox(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/upload-links/{uploadLinkId}/inbox");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(GetUploadLinkInboxRequest req, CancellationToken ct)
    {
        var items = await _galleryService.GetUploadLinkInboxAsync(req.UploadLinkId, ct);
        if (!items.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(items.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetUploadLinkInboxResponse { Items = [.. items.Value.Select(ToDto)] },
            cancellation: ct
        );
    }

    private GetUploadLinkInboxItemDto ToDto(GalleryItemSummary item) =>
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
            UploaderName = item.UploaderName,
            Urls = GalleryMediaUrls.Of(
                _signer,
                item.MediaItemId,
                item.Kind,
                item.RenderedAt,
                item.Owner
            ),
        };
}

public sealed record GetUploadLinkInboxRequest
{
    [RouteParam]
    public required int UploadLinkId { get; init; }
}

public sealed class GetUploadLinkInboxValidator : Validator<GetUploadLinkInboxRequest>
{
    public GetUploadLinkInboxValidator()
    {
        RuleFor(request => request.UploadLinkId).GreaterThan(0);
    }
}

public sealed record GetUploadLinkInboxResponse
{
    public required IReadOnlyList<GetUploadLinkInboxItemDto> Items { get; init; }
}

public sealed record GetUploadLinkInboxItemDto
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

    public required string? UploaderName { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
