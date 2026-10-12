using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Website;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class PostWebsitePictureFromGallery
    : Endpoint<PostWebsitePictureFromGalleryRequest, PostWebsitePictureFromGalleryResponse>
{
    private readonly WebsitePictureService _websitePictures;

    public PostWebsitePictureFromGallery(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Post("website-pictures/{slotKey}/{position}/from-gallery");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(
        PostWebsitePictureFromGalleryRequest req,
        CancellationToken ct
    )
    {
        var result = await _websitePictures.PickFromGalleryAsync(
            ToCommand(req, User.PersonId()),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostWebsitePictureFromGalleryResponse { MediaItemId = result.Value },
            cancellation: ct
        );
    }

    private static PickWebsitePictureCommand ToCommand(
        PostWebsitePictureFromGalleryRequest req,
        int? pickedByPersonId
    ) =>
        new()
        {
            Slot = new PictureSlotPosition(req.SlotKey, req.Position),
            GalleryItemId = req.GalleryItemId,
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
            Aspect = req.Aspect,
            PickedByPersonId = pickedByPersonId,
        };
}

public sealed record PostWebsitePictureFromGalleryRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }

    public required int GalleryItemId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }

    public required double Aspect { get; init; }
}

public sealed class PostWebsitePictureFromGalleryValidator
    : Validator<PostWebsitePictureFromGalleryRequest>
{
    public PostWebsitePictureFromGalleryValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
        RuleFor(request => request.GalleryItemId).GreaterThan(0);
        RuleFor(request => request.Aspect).Aspect();
        RuleFor(request => new PictureCrop(
                request.Left,
                request.Top,
                request.Width,
                request.Height
            ))
            .CutOfThePicture()
            .OverridePropertyName("crop");
    }
}

public sealed record PostWebsitePictureFromGalleryResponse
{
    public required int MediaItemId { get; init; }
}
