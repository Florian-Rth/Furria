using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Events;
using Furria.Core.Media;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class PostEventPictureFromGallery
    : Endpoint<PostEventPictureFromGalleryRequest, PostEventPictureFromGalleryResponse>
{
    private readonly EventPictures _eventPictures;

    public PostEventPictureFromGallery(EventPictures eventPictures)
    {
        _eventPictures = eventPictures;
    }

    public override void Configure()
    {
        Post("events/{eventId}/picture/from-gallery");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(
        PostEventPictureFromGalleryRequest req,
        CancellationToken ct
    )
    {
        var result = await _eventPictures.PickFromGalleryAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostEventPictureFromGalleryResponse { MediaItemId = result.Value },
            cancellation: ct
        );
    }

    private static PickEventPictureCommand ToCommand(PostEventPictureFromGalleryRequest req) =>
        new()
        {
            EventId = req.EventId,
            GalleryItemId = req.GalleryItemId,
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
        };
}

public sealed record PostEventPictureFromGalleryRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required int GalleryItemId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PostEventPictureFromGalleryValidator
    : Validator<PostEventPictureFromGalleryRequest>
{
    public PostEventPictureFromGalleryValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.GalleryItemId).GreaterThan(0);
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

public sealed record PostEventPictureFromGalleryResponse
{
    public required int MediaItemId { get; init; }
}
