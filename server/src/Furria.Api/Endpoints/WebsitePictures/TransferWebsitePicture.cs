using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Website;
using Furria.Core.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class TransferWebsitePicture : Endpoint<TransferWebsitePictureRequest>
{
    private readonly WebsitePictureService _websitePictures;

    public TransferWebsitePicture(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Post("website-pictures/transfer");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(TransferWebsitePictureRequest req, CancellationToken ct)
    {
        var result = await _websitePictures.TransferAsync(
            new TransferWebsitePictureCommand
            {
                From = new PictureSlotPosition(req.FromSlotKey, req.FromPosition),
                To = new PictureSlotPosition(req.ToSlotKey, req.ToPosition),
                TransferredByPersonId = User.PersonId(),
            },
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

public sealed record TransferWebsitePictureRequest
{
    public required string FromSlotKey { get; init; }

    public required int FromPosition { get; init; }

    public required string ToSlotKey { get; init; }

    public required int ToPosition { get; init; }
}

public sealed class TransferWebsitePictureValidator : Validator<TransferWebsitePictureRequest>
{
    public TransferWebsitePictureValidator()
    {
        RuleFor(request => request.FromSlotKey).SlotKey();
        RuleFor(request => request.FromPosition).Position();
        RuleFor(request => request.ToSlotKey).SlotKey();
        RuleFor(request => request.ToPosition).Position();
    }
}
