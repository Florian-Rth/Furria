using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryAlbumById
    : Endpoint<GetGalleryAlbumByIdRequest, GetGalleryAlbumByIdResponse>
{
    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGalleryAlbumById(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/albums/{albumId}");
        Definition.RequireAnyPermission(GalleryKeys.Viewers);
    }

    public override async Task HandleAsync(GetGalleryAlbumByIdRequest req, CancellationToken ct)
    {
        var album = await _galleryService.GetAlbumAsync(
            new AlbumItemsQuery
            {
                AlbumId = req.AlbumId,
                Kind = req.Kind,
                UploaderPersonId = req.UploaderPersonId,
            },
            ct
        );
        if (album is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(album), cancellation: ct);
    }

    private GetGalleryAlbumByIdResponse ToResponse(AlbumDetails album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            Description = album.Description,
            CalendarEntry = album.CalendarEntry is { } entry
                ? new GetGalleryAlbumByIdEntryDto
                {
                    CalendarEntryId = entry.CalendarEntryId,
                    Title = entry.Title,
                    StartsAt = entry.StartsAt,
                }
                : null,
            SessionStartYear = album.SessionStartYear,
            PublishedAt = album.PublishedAt,
            CoverMediaItemId = album.CoverMediaItemId,
            ChosenCoverMediaItemId = album.ChosenCoverMediaItemId,
            Photos = album.Photos,
            Videos = album.Videos,
            Uploaders =
            [
                .. album.Uploaders.Select(uploader => new GetGalleryAlbumByIdUploaderCountDto
                {
                    Uploader = uploader.Uploader is { } person ? ToDto(person) : null,
                    Count = uploader.Count,
                }),
            ],
            Items = [.. album.Items.Select(ToDto)],
            ZipUrl = _signer.AlbumZipUrlOf(album.AlbumId),
        };

    private GetGalleryAlbumByIdItemDto ToDto(GalleryItemSummary item) =>
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
            Uploader = item.Uploader is { } person ? ToDto(person) : null,
            SelectionPosition = item.SelectionPosition,
            Caption = item.Caption,
            Urls = GalleryMediaUrls.Of(_signer, item.MediaItemId, item.Kind),
        };

    private static GetGalleryAlbumByIdUploaderDto ToDto(GalleryUploader uploader) =>
        new()
        {
            PersonId = uploader.PersonId,
            FirstName = uploader.FirstName,
            LastName = uploader.LastName,
        };
}

public sealed record GetGalleryAlbumByIdRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }

    [QueryParam]
    public MediaKind? Kind { get; init; }

    [QueryParam]
    public int? UploaderPersonId { get; init; }
}

public sealed class GetGalleryAlbumByIdValidator : Validator<GetGalleryAlbumByIdRequest>
{
    public GetGalleryAlbumByIdValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
        RuleFor(request => request.Kind).IsInEnum();
        RuleFor(request => request.UploaderPersonId).GreaterThan(0);
    }
}

public sealed record GetGalleryAlbumByIdResponse
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required GetGalleryAlbumByIdEntryDto? CalendarEntry { get; init; }

    public required int? SessionStartYear { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required int? CoverMediaItemId { get; init; }

    public required int? ChosenCoverMediaItemId { get; init; }

    public required int Photos { get; init; }

    public required int Videos { get; init; }

    public required IReadOnlyList<GetGalleryAlbumByIdUploaderCountDto> Uploaders { get; init; }

    public required IReadOnlyList<GetGalleryAlbumByIdItemDto> Items { get; init; }

    public required string ZipUrl { get; init; }
}

public sealed record GetGalleryAlbumByIdEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }
}

public sealed record GetGalleryAlbumByIdUploaderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record GetGalleryAlbumByIdUploaderCountDto
{
    public required GetGalleryAlbumByIdUploaderDto? Uploader { get; init; }

    public required int Count { get; init; }
}

public sealed record GetGalleryAlbumByIdItemDto
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

    public required GetGalleryAlbumByIdUploaderDto? Uploader { get; init; }

    public required int? SelectionPosition { get; init; }

    public required string? Caption { get; init; }

    public required GalleryMediaUrlsDto Urls { get; init; }
}
