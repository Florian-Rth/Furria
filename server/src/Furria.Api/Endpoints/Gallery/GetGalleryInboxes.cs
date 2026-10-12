using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryInboxes : EndpointWithoutRequest<GetGalleryInboxesResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGalleryInboxes(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/inboxes");
        Definition.RequireAnyPermission(GalleryKeys.Sorters);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var inboxes = await _galleryService.GetInboxesAsync(User.AccountId()!.Value, ct);

        await Send.OkAsync(
            new GetGalleryInboxesResponse { Inboxes = [.. inboxes.Select(ToDto)] },
            cancellation: ct
        );
    }

    private GetGalleryInboxesInboxDto ToDto(InboxSummary inbox) =>
        new()
        {
            Uploader = inbox.Uploader is { } uploader
                ? new GetGalleryInboxesUploaderDto
                {
                    PersonId = uploader.PersonId,
                    FirstName = uploader.FirstName,
                    LastName = uploader.LastName,
                }
                : null,
            Photos = inbox.Photos,
            Videos = inbox.Videos,
            LatestUploadedAt = inbox.LatestUploadedAt,
            Samples = [.. inbox.Samples.Select(ToDto)],
        };

    private GetGalleryInboxesMediaDto ToDto(GalleryMediaRef media) =>
        new()
        {
            MediaItemId = media.MediaItemId,
            Kind = media.Kind,
            State = media.State,
            Width = media.Width,
            Height = media.Height,
            CapturedAt = media.CapturedAt,
            Urls = GalleryMediaUrls.Of(_signer, media.MediaItemId, media.Kind, media.RenderedAt),
        };
}

public sealed record GetGalleryInboxesResponse
{
    public required IReadOnlyList<GetGalleryInboxesInboxDto> Inboxes { get; init; }
}

public sealed record GetGalleryInboxesInboxDto
{
    public required GetGalleryInboxesUploaderDto? Uploader { get; init; }

    public required int Photos { get; init; }

    public required int Videos { get; init; }

    public required DateTimeOffset LatestUploadedAt { get; init; }

    public required IReadOnlyList<GetGalleryInboxesMediaDto> Samples { get; init; }
}

public sealed record GetGalleryInboxesMediaDto
{
    public required int MediaItemId { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int? Width { get; init; }

    public required int? Height { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}

public sealed record GetGalleryInboxesUploaderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
