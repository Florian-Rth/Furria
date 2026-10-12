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

public sealed class PutWebsitePictureCrop : Endpoint<PutWebsitePictureCropRequest>
{
    private readonly WebsitePictureService _websitePictures;

    public PutWebsitePictureCrop(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Put("website-pictures/{slotKey}/{position}/crop");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(PutWebsitePictureCropRequest req, CancellationToken ct)
    {
        var result = await _websitePictures.CropAsync(ToCommand(req, User.PersonId()), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static CropWebsitePictureCommand ToCommand(
        PutWebsitePictureCropRequest req,
        int? croppedByPersonId
    ) =>
        new()
        {
            Slot = new PictureSlotPosition(req.SlotKey, req.Position),
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
            Aspect = req.Aspect,
            CroppedByPersonId = croppedByPersonId,
        };
}

public sealed record PutWebsitePictureCropRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }

    public required double Aspect { get; init; }
}

public sealed class PutWebsitePictureCropValidator : Validator<PutWebsitePictureCropRequest>
{
    public PutWebsitePictureCropValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
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
