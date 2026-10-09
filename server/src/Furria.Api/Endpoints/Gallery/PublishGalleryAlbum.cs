using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PublishGalleryAlbum : Endpoint<PublishGalleryAlbumRequest>
{
    private readonly GalleryService _galleryService;

    public PublishGalleryAlbum(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Post("gallery/albums/{albumId}/publication");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(PublishGalleryAlbumRequest req, CancellationToken ct)
    {
        var result = await _galleryService.PublishAsync(req.AlbumId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PublishGalleryAlbumRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }
}

public sealed class PublishGalleryAlbumValidator : Validator<PublishGalleryAlbumRequest>
{
    public PublishGalleryAlbumValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}
