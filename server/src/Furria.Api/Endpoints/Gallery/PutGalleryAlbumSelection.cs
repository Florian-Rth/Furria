using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PutGalleryAlbumSelection : Endpoint<PutGalleryAlbumSelectionRequest>
{
    private readonly GalleryService _galleryService;

    public PutGalleryAlbumSelection(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Put("gallery/albums/{albumId}/selection");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(
        PutGalleryAlbumSelectionRequest req,
        CancellationToken ct
    )
    {
        var result = await _galleryService.SetSelectionAsync(
            new AlbumSelectionCommand
            {
                AlbumId = req.AlbumId,
                Entries =
                [
                    .. req.Photos.Select(photo => new AlbumSelectionEntry(
                        photo.MediaItemId,
                        photo.Caption
                    )),
                ],
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutGalleryAlbumSelectionRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }

    public required IReadOnlyList<PutGalleryAlbumSelectionPhotoDto> Photos { get; init; }
}

public sealed record PutGalleryAlbumSelectionPhotoDto
{
    public required int MediaItemId { get; init; }

    public required string? Caption { get; init; }
}

public sealed class PutGalleryAlbumSelectionValidator : Validator<PutGalleryAlbumSelectionRequest>
{
    public PutGalleryAlbumSelectionValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
        RuleFor(request => request.Photos).NotNull();
        RuleForEach(request => request.Photos)
            .ChildRules(photo =>
            {
                photo.RuleFor(entry => entry.MediaItemId).GreaterThan(0);
                photo.RuleFor(entry => entry.Caption).MaximumLength(MediaItem.CaptionLength);
            });
    }
}
