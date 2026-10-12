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

public sealed class PostWebsitePictureFromSlot
    : Endpoint<PostWebsitePictureFromSlotRequest, PostWebsitePictureFromSlotResponse>
{
    private readonly WebsitePictureService _websitePictures;

    public PostWebsitePictureFromSlot(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Post("website-pictures/{slotKey}/{position}/from-slot");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(
        PostWebsitePictureFromSlotRequest req,
        CancellationToken ct
    )
    {
        var result = await _websitePictures.CopyFromSlotAsync(ToCommand(req, User.PersonId()), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostWebsitePictureFromSlotResponse { MediaItemId = result.Value },
            cancellation: ct
        );
    }

    private static CopyWebsitePictureCommand ToCommand(
        PostWebsitePictureFromSlotRequest req,
        int? copiedByPersonId
    ) =>
        new()
        {
            Slot = new PictureSlotPosition(req.SlotKey, req.Position),
            SourceSlot = new PictureSlotPosition(req.SourceSlotKey, req.SourcePosition),
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
            Aspect = req.Aspect,
            CopiedByPersonId = copiedByPersonId,
        };
}

public sealed record PostWebsitePictureFromSlotRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }

    public required string SourceSlotKey { get; init; }

    public required int SourcePosition { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }

    public required double Aspect { get; init; }
}

public sealed class PostWebsitePictureFromSlotValidator
    : Validator<PostWebsitePictureFromSlotRequest>
{
    public PostWebsitePictureFromSlotValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
        RuleFor(request => request.SourceSlotKey).SlotKey();
        RuleFor(request => request.SourcePosition).Position();
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

public sealed record PostWebsitePictureFromSlotResponse
{
    public required int MediaItemId { get; init; }
}
