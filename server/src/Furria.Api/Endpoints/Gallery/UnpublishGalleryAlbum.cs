using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class UnpublishGalleryAlbum : Endpoint<UnpublishGalleryAlbumRequest>
{
    private readonly GalleryService _galleryService;

    public UnpublishGalleryAlbum(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Delete("gallery/albums/{albumId}/publication");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(UnpublishGalleryAlbumRequest req, CancellationToken ct)
    {
        var result = await _galleryService.UnpublishAsync(req.AlbumId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record UnpublishGalleryAlbumRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }
}

public sealed class UnpublishGalleryAlbumValidator : Validator<UnpublishGalleryAlbumRequest>
{
    public UnpublishGalleryAlbumValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}
