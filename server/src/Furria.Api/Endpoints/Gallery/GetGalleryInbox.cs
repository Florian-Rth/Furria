using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryInbox : Endpoint<GetGalleryInboxRequest, GetGalleryInboxResponse>
{
    private readonly GalleryService _galleryService;
    private readonly PermissionAuthorizer _authorizer;
    private readonly MediaUrlSigner _signer;

    public GetGalleryInbox(
        GalleryService galleryService,
        PermissionAuthorizer authorizer,
        MediaUrlSigner signer
    )
    {
        _galleryService = galleryService;
        _authorizer = authorizer;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/inbox");
        Definition.RequireAnyPermission(GalleryKeys.Sorters);
    }

    public override async Task HandleAsync(GetGalleryInboxRequest req, CancellationToken ct)
    {
        var actor = await _authorizer.GalleryActorAsync(User.AccountId()!.Value, ct);
        var uploaderPersonId = req.Ownerless ? null : req.UploaderPersonId ?? actor.PersonId;
        if (!actor.MayManage && (uploaderPersonId is null || uploaderPersonId != actor.PersonId))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var items = await _galleryService.GetInboxItemsAsync(uploaderPersonId, ct);

        await Send.OkAsync(
            new GetGalleryInboxResponse { Items = [.. items.Select(ToDto)] },
            cancellation: ct
        );
    }

    private GetGalleryInboxItemDto ToDto(GalleryItemSummary item) =>
        new()
        {
            MediaItemId = item.MediaItemId,
            Kind = item.Kind,
            State = item.State,
            Width = item.Width,
            Height = item.Height,
            DurationSeconds = item.DurationSeconds,
            CapturedAt = item.CapturedAt,
            UploadedAt = item.UploadedAt,
            Camera = item.Camera,
            OriginalFileName = item.OriginalFileName,
            Urls = GalleryMediaUrls.Of(_signer, item.MediaItemId, item.Kind),
        };
}

public sealed record GetGalleryInboxRequest
{
    [QueryParam]
    public int? UploaderPersonId { get; init; }

    [QueryParam]
    public bool Ownerless { get; init; }
}

public sealed class GetGalleryInboxValidator : Validator<GetGalleryInboxRequest>
{
    public GetGalleryInboxValidator()
    {
        RuleFor(request => request.UploaderPersonId).GreaterThan(0);
        RuleFor(request => request.UploaderPersonId).Null().When(request => request.Ownerless);
    }
}

public sealed record GetGalleryInboxResponse
{
    public required IReadOnlyList<GetGalleryInboxItemDto> Items { get; init; }
}

public sealed record GetGalleryInboxItemDto
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required double? DurationSeconds { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required DateTimeOffset UploadedAt { get; init; }

    public required string? Camera { get; init; }

    public required string OriginalFileName { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
