using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Gallery;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class DeleteGalleryItems : Endpoint<DeleteGalleryItemsRequest>
{
    private readonly GalleryService _galleryService;
    private readonly PermissionAuthorizer _authorizer;

    public DeleteGalleryItems(GalleryService galleryService, PermissionAuthorizer authorizer)
    {
        _galleryService = galleryService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("gallery/items/deletion");
        Definition.RequireAnyPermission(GalleryKeys.Sorters);
    }

    public override async Task HandleAsync(DeleteGalleryItemsRequest req, CancellationToken ct)
    {
        var result = await _galleryService.DeleteItemsAsync(
            new DeleteGalleryItemsCommand
            {
                Actor = await _authorizer.GalleryActorAsync(User.AccountId()!.Value, ct),
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

public sealed record DeleteGalleryItemsRequest
{
    public required IReadOnlyList<int> MediaItemIds { get; init; }
}

public sealed class DeleteGalleryItemsValidator : Validator<DeleteGalleryItemsRequest>
{
    public DeleteGalleryItemsValidator()
    {
        RuleFor(request => request.MediaItemIds)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(ids => ids.Count <= GalleryBulk.MaxItems);
        RuleForEach(request => request.MediaItemIds).GreaterThan(0);
    }
}
