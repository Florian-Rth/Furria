using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Gallery;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PlaceGalleryItems : Endpoint<PlaceGalleryItemsRequest>
{
    private readonly GalleryService _galleryService;
    private readonly PermissionAuthorizer _authorizer;

    public PlaceGalleryItems(GalleryService galleryService, PermissionAuthorizer authorizer)
    {
        _galleryService = galleryService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("gallery/items/placement");
        Definition.RequireAnyPermission(GalleryKeys.Sorters);
    }

    public override async Task HandleAsync(PlaceGalleryItemsRequest req, CancellationToken ct)
    {
        var result = await _galleryService.PlaceItemsAsync(
            new PlaceGalleryItemsCommand
            {
                Actor = await _authorizer.GalleryActorAsync(User.AccountId()!.Value, ct),
                AlbumId = req.AlbumId,
                MediaItemIds = req.MediaItemIds,
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

public sealed record PlaceGalleryItemsRequest
{
    public required int AlbumId { get; init; }

    public required IReadOnlyList<int> MediaItemIds { get; init; }
}

public sealed class PlaceGalleryItemsValidator : Validator<PlaceGalleryItemsRequest>
{
    public PlaceGalleryItemsValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
        RuleFor(request => request.MediaItemIds)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(ids => ids.Count <= GalleryBulk.MaxItems);
        RuleForEach(request => request.MediaItemIds).GreaterThan(0);
    }
}
