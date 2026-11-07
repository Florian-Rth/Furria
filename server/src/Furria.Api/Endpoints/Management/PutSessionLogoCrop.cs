using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Management;

public sealed class PutSessionLogoCrop : Endpoint<PutSessionLogoCropRequest>
{
    private readonly PictureService _pictureService;

    public PutSessionLogoCrop(PictureService pictureService)
    {
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Put("manage/sessions/{sessionId}/logo/crop");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutSessionLogoCropRequest req, CancellationToken ct)
    {
        var result = await _pictureService.CropAsync(
            MediaOwner.Session(req.SessionId),
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

    private static PictureCrop ToCrop(PutSessionLogoCropRequest req) =>
        new(req.Left, req.Top, req.Width, req.Height);
}

public sealed record PutSessionLogoCropRequest
{
    [RouteParam]
    public required int SessionId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PutSessionLogoCropValidator : Validator<PutSessionLogoCropRequest>
{
    public PutSessionLogoCropValidator()
    {
        RuleFor(request => request.SessionId).GreaterThan(0);
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
