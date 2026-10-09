using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetPublicGalleryPhoto : Endpoint<GetPublicGalleryPhotoRequest>
{
    private readonly PublicMediaService _publicMediaService;

    public GetPublicGalleryPhoto(PublicMediaService publicMediaService)
    {
        _publicMediaService = publicMediaService;
    }

    public override void Configure()
    {
        Get("public/gallery/photos/{mediaItemId}/{rendition}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicGalleryPhotoRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = MediaFileResults.UncachedByTheEdge;
        var file = await _publicMediaService.GalleryPhotoFileAsync(
            req.MediaItemId,
            req.Rendition,
            ct
        );
        if (file is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.ResultAsync(MediaFileResults.Of(file, asDownload: false));
    }
}

public sealed record GetPublicGalleryPhotoRequest
{
    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicGalleryPhotoValidator : Validator<GetPublicGalleryPhotoRequest>
{
    public GetPublicGalleryPhotoValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
