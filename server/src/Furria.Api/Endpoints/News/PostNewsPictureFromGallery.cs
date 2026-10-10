using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.Media;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PostNewsPictureFromGallery
    : Endpoint<PostNewsPictureFromGalleryRequest, PostNewsPictureFromGalleryResponse>
{
    private readonly NewsPictures _newsPictures;

    public PostNewsPictureFromGallery(NewsPictures newsPictures)
    {
        _newsPictures = newsPictures;
    }

    public override void Configure()
    {
        Post("news/{newsPostId}/picture/from-gallery");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(
        PostNewsPictureFromGalleryRequest req,
        CancellationToken ct
    )
    {
        var result = await _newsPictures.PickFromGalleryAsync(ToCommand(req, User.PersonId()), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostNewsPictureFromGalleryResponse { MediaItemId = result.Value },
            cancellation: ct
        );
    }

    private static PickNewsPictureCommand ToCommand(
        PostNewsPictureFromGalleryRequest req,
        int? pickedByPersonId
    ) =>
        new()
        {
            NewsPostId = req.NewsPostId,
            GalleryItemId = req.GalleryItemId,
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
            PickedByPersonId = pickedByPersonId,
        };
}

public sealed record PostNewsPictureFromGalleryRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }

    public required int GalleryItemId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PostNewsPictureFromGalleryValidator
    : Validator<PostNewsPictureFromGalleryRequest>
{
    public PostNewsPictureFromGalleryValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
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

public sealed record PostNewsPictureFromGalleryResponse
{
    public required int MediaItemId { get; init; }
}
