using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryInboxes : EndpointWithoutRequest<GetGalleryInboxesResponse>
{
    private readonly GalleryService _galleryService;

    public GetGalleryInboxes(GalleryService galleryService)
    {
        _galleryService = galleryService;
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

    private static GetGalleryInboxesInboxDto ToDto(InboxSummary inbox) =>
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
}

public sealed record GetGalleryInboxesUploaderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
