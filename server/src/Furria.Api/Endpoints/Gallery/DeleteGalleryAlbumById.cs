using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class DeleteGalleryAlbumById : Endpoint<DeleteGalleryAlbumByIdRequest>
{
    private readonly GalleryService _galleryService;

    public DeleteGalleryAlbumById(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Delete("gallery/albums/{albumId}");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(DeleteGalleryAlbumByIdRequest req, CancellationToken ct)
    {
        var result = await _galleryService.BinAlbumAsync(req.AlbumId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteGalleryAlbumByIdRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }
}

public sealed class DeleteGalleryAlbumByIdValidator : Validator<DeleteGalleryAlbumByIdRequest>
{
    public DeleteGalleryAlbumByIdValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}
