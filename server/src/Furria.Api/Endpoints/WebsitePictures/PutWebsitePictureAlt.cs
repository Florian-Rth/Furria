using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Website;
using Furria.Core.Website;
using Furria.Infrastructure.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class PutWebsitePictureAlt : Endpoint<PutWebsitePictureAltRequest>
{
    private readonly WebsitePictureService _websitePictures;

    public PutWebsitePictureAlt(WebsitePictureService websitePictures)
    {
        _websitePictures = websitePictures;
    }

    public override void Configure()
    {
        Put("website-pictures/{slotKey}/{position}/alt");
        Definition.RequirePermission(FurriaPermissions.GalleryPublish);
    }

    public override async Task HandleAsync(PutWebsitePictureAltRequest req, CancellationToken ct)
    {
        var result = await _websitePictures.DescribeAsync(
            new DescribeWebsitePictureCommand
            {
                Slot = new PictureSlotPosition(req.SlotKey, req.Position),
                Alt = req.Alt,
                DescribedByPersonId = User.PersonId(),
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

public sealed record PutWebsitePictureAltRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }

    public required string? Alt { get; init; }
}

public sealed class PutWebsitePictureAltValidator : Validator<PutWebsitePictureAltRequest>
{
    private const string MultilineMessage = "Ein Bildtext steht in einer Zeile.";

    public PutWebsitePictureAltValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
        RuleFor(request => request.Alt)
            .MaximumLength(WebsitePicture.AltLength)
            .Must(alt => alt?.IndexOfAny(['\r', '\n']) is null or < 0)
            .WithMessage(MultilineMessage);
    }
}
