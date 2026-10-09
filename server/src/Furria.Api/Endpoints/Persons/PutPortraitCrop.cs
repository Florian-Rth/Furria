using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutPortraitCrop : Endpoint<PutPortraitCropRequest>
{
    private readonly MediaOwnerAccess _ownerAccess;
    private readonly PictureService _pictureService;

    public PutPortraitCrop(MediaOwnerAccess ownerAccess, PictureService pictureService)
    {
        _ownerAccess = ownerAccess;
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Put("persons/{personId}/portrait/crop");
    }

    public override async Task HandleAsync(PutPortraitCropRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var owner = MediaOwner.Person(req.PersonId);
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

    private static PictureCrop ToCrop(PutPortraitCropRequest req) =>
        new(req.Left, req.Top, req.Width, req.Height);
}

public sealed record PutPortraitCropRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required double Left { get; init; }

    public required double Top { get; init; }

    public required double Width { get; init; }

    public required double Height { get; init; }
}

public sealed class PutPortraitCropValidator : Validator<PutPortraitCropRequest>
{
    public PutPortraitCropValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
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
