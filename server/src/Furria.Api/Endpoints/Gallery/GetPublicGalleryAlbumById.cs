using FastEndpoints;
using FluentValidation;
using Furria.Application.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetPublicGalleryAlbumById
    : Endpoint<GetPublicGalleryAlbumByIdRequest, GetPublicGalleryAlbumByIdResponse>
{
    private readonly GalleryService _galleryService;

    public GetPublicGalleryAlbumById(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Get("public/gallery/{albumId}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(
        GetPublicGalleryAlbumByIdRequest req,
        CancellationToken ct
    )
    {
        var details = await _galleryService.GetPublicAlbumAsync(req.AlbumId, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetPublicGalleryAlbumByIdResponse ToResponse(PublicAlbumDetails details) =>
        new()
        {
            AlbumId = details.AlbumId,
            Title = details.Title,
            Description = details.Description,
            EntryStartsAt = details.EntryStartsAt,
            SessionStartYear = details.SessionStartYear,
            SessionNumber = details.SessionNumber,
            Photos = [.. details.Photos.Select(ToDto)],
        };

    private static PublicAlbumPhotoDto ToDto(PublicGalleryPhoto photo) =>
        new()
        {
            MediaItemId = photo.MediaItemId,
            Width = photo.Width,
            Height = photo.Height,
            Caption = photo.Caption,
            SmallUrl = photo.Picture.SmallUrl,
            MediumUrl = photo.Picture.MediumUrl,
            LargeUrl = photo.Picture.LargeUrl,
        };
}

public sealed record GetPublicGalleryAlbumByIdRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }
}

public sealed class GetPublicGalleryAlbumByIdValidator : Validator<GetPublicGalleryAlbumByIdRequest>
{
    public GetPublicGalleryAlbumByIdValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}

public sealed record GetPublicGalleryAlbumByIdResponse
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required DateTimeOffset? EntryStartsAt { get; init; }

    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicAlbumPhotoDto> Photos { get; init; }
}

public sealed record PublicAlbumPhotoDto
{
    public required int MediaItemId { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string? Caption { get; init; }

    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }
}
