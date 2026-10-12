using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Events;

public sealed class PutEventPictureCrop : Endpoint<PutEventPictureCropRequest>
{
    private readonly PictureService _pictureService;

    public PutEventPictureCrop(PictureService pictureService)
    {
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Put("events/{eventId}/picture/crop");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(PutEventPictureCropRequest req, CancellationToken ct)
    {
        var result = await _pictureService.CropAsync(
            MediaOwner.Event(req.EventId),
            ToCrop(req),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static PictureCrop ToCrop(PutEventPictureCropRequest req) =>
        new(req.Left, req.Top, req.Width, req.Height);
}

public sealed record PutEventPictureCropRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PutEventPictureCropValidator : Validator<PutEventPictureCropRequest>
{
    public PutEventPictureCropValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => new PictureCrop(
                request.Left,
                request.Top,
                request.Width,
                request.Height
            ))
            .Must(crop => crop.IsCutOfThePicture())
            .OverridePropertyName("crop")
            .WithMessage("The crop must be a cut of the picture.");
    }
}
