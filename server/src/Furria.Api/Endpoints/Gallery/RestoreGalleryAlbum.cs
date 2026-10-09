using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class RestoreGalleryAlbum : Endpoint<RestoreGalleryAlbumRequest>
{
    private readonly GalleryService _galleryService;

    public RestoreGalleryAlbum(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Post("gallery/albums/{albumId}/restore");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(RestoreGalleryAlbumRequest req, CancellationToken ct)
    {
        var result = await _galleryService.RestoreAlbumAsync(req.AlbumId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreGalleryAlbumRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }
}

public sealed class RestoreGalleryAlbumValidator : Validator<RestoreGalleryAlbumRequest>
{
    public RestoreGalleryAlbumValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}
