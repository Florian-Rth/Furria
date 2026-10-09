using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Club;

public sealed class GetPublicBoardPortrait : Endpoint<GetPublicBoardPortraitRequest>
{
    private readonly PublicMediaService _publicMediaService;

    public GetPublicBoardPortrait(PublicMediaService publicMediaService)
    {
        _publicMediaService = publicMediaService;
    }

    public override void Configure()
    {
        Get("public/board/portraits/{mediaItemId}/{rendition}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicBoardPortraitRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = MediaFileResults.UncachedByTheEdge;
        var file = await _publicMediaService.BoardPortraitFileAsync(
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

public sealed record GetPublicBoardPortraitRequest
{
    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicBoardPortraitValidator : Validator<GetPublicBoardPortraitRequest>
{
    public GetPublicBoardPortraitValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
