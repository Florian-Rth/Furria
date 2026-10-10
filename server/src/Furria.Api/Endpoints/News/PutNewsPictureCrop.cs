using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.Media;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PutNewsPictureCrop : Endpoint<PutNewsPictureCropRequest>
{
    private readonly NewsPictures _newsPictures;

    public PutNewsPictureCrop(NewsPictures newsPictures)
    {
        _newsPictures = newsPictures;
    }

    public override void Configure()
    {
        Put("news/{newsPostId}/picture/crop");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(PutNewsPictureCropRequest req, CancellationToken ct)
    {
        var result = await _newsPictures.CropAsync(ToCommand(req, User.PersonId()), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static CropNewsPictureCommand ToCommand(
        PutNewsPictureCropRequest req,
        int? croppedByPersonId
    ) =>
        new()
        {
            NewsPostId = req.NewsPostId,
            Crop = new PictureCrop(req.Left, req.Top, req.Width, req.Height),
            CroppedByPersonId = croppedByPersonId,
        };
}

public sealed record PutNewsPictureCropRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PutNewsPictureCropValidator : Validator<PutNewsPictureCropRequest>
{
    public PutNewsPictureCropValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
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
