using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class RestoreGalleryItems : Endpoint<RestoreGalleryItemsRequest>
{
    private readonly GalleryService _galleryService;

    public RestoreGalleryItems(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Post("gallery/items/restoration");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(RestoreGalleryItemsRequest req, CancellationToken ct)
    {
        var result = await _galleryService.RestoreItemsAsync(req.MediaItemIds, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreGalleryItemsRequest
{
    public required IReadOnlyList<int> MediaItemIds { get; init; }
}

public sealed class RestoreGalleryItemsValidator : Validator<RestoreGalleryItemsRequest>
{
    public RestoreGalleryItemsValidator()
    {
        RuleFor(request => request.MediaItemIds)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(ids => ids.Count <= GalleryBulk.MaxItems);
        RuleForEach(request => request.MediaItemIds).GreaterThan(0);
    }
}
