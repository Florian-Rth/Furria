using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class DeleteWebsitePicture : Endpoint<DeleteWebsitePictureRequest>
{
    private readonly WebsitePictureService _websitePictures;

    public DeleteWebsitePicture(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Delete("website-pictures/{slotKey}/{position}");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(DeleteWebsitePictureRequest req, CancellationToken ct)
    {
        var result = await _websitePictures.ClearAsync(
            new PictureSlotPosition(req.SlotKey, req.Position),
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

public sealed record DeleteWebsitePictureRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }
}

public sealed class DeleteWebsitePictureValidator : Validator<DeleteWebsitePictureRequest>
{
    public DeleteWebsitePictureValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
    }
}
