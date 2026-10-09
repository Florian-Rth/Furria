using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroupPictureCrop : Endpoint<PutGroupPictureCropRequest>
{
    private readonly MediaOwnerAccess _ownerAccess;
    private readonly PictureService _pictureService;

    public PutGroupPictureCrop(MediaOwnerAccess ownerAccess, PictureService pictureService)
    {
        _ownerAccess = ownerAccess;
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/picture/crop");
    }

    public override async Task HandleAsync(PutGroupPictureCropRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var owner = MediaOwner.Group(req.GroupId);
        var access = await _ownerAccess.MayUploadAsync(accountId.Value, owner, ct);
        var result = access.IsSuccess
            ? await _pictureService.CropAsync(owner, ToCrop(req), ct)
            : access;
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static PictureCrop ToCrop(PutGroupPictureCropRequest req) =>
        new(req.Left, req.Top, req.Width, req.Height);
}

public sealed record PutGroupPictureCropRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PutGroupPictureCropValidator : Validator<PutGroupPictureCropRequest>
{
    public PutGroupPictureCropValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
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
