using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.News;

public sealed class GetPublicNewsPicture : Endpoint<GetPublicNewsPictureRequest>
{
    private readonly PublicMediaService _publicMediaService;

    public GetPublicNewsPicture(PublicMediaService publicMediaService)
    {
        _publicMediaService = publicMediaService;
    }

    public override void Configure()
    {
        Get("public/news/pictures/{mediaItemId}/{rendition}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicNewsPictureRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = MediaFileResults.UncachedByTheEdge;
        var file = await _publicMediaService.NewsPictureFileAsync(
            req.MediaItemId,
            req.Rendition,
            ct
        );
        if (file is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.ResultAsync(MediaFileResults.Of(file, asDownload: false));
    }
}

public sealed record GetPublicNewsPictureRequest
{
    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicNewsPictureValidator : Validator<GetPublicNewsPictureRequest>
{
    public GetPublicNewsPictureValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
