using System.Globalization;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Application.Website;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Infrastructure.Website;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.WebsitePictures;

public sealed class GetPublicWebsitePicture : Endpoint<GetPublicWebsitePictureRequest>
{
    private static readonly string RevalidatedOnEveryFetch = new CacheControlHeaderValue
    {
        Private = true,
        NoCache = true,
    }.ToString();

    private readonly PublicWebsitePictures _publicWebsitePictures;

    public GetPublicWebsitePicture(PublicWebsitePictures publicWebsitePictures)
    {
        _publicWebsitePictures = publicWebsitePictures;
    }

    public override void Configure()
    {
        Get(PublicWebsitePictures.Route);
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicWebsitePictureRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = RevalidatedOnEveryFetch;
        var shown = await _publicWebsitePictures.FileAsync(
            new PictureSlotPosition(req.SlotKey, req.Position),
            req.Rendition,
            ct
        );
        if (shown is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.ResultAsync(MediaFileResults.Of(shown.File, EntityTagOf(shown)));
    }

    private static EntityTagHeaderValue EntityTagOf(PublicWebsitePictureFile shown) =>
        new(
            string.Create(
                CultureInfo.InvariantCulture,
                $"\"{shown.MediaItemId}-{shown.RenderedAt.ToUnixTimeMilliseconds()}\""
            )
        );
}

public sealed record GetPublicWebsitePictureRequest
{
    [RouteParam]
    public required string SlotKey { get; init; }

    [RouteParam]
    public required int Position { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicWebsitePictureValidator : Validator<GetPublicWebsitePictureRequest>
{
    public GetPublicWebsitePictureValidator()
    {
        RuleFor(request => request.SlotKey).SlotKey();
        RuleFor(request => request.Position).Position();
    }
}
