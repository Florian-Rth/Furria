using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetPublicGroupPicture : Endpoint<GetPublicGroupPictureRequest>
{
    private readonly PublicMediaService _publicMediaService;

    public GetPublicGroupPicture(PublicMediaService publicMediaService)
    {
        _publicMediaService = publicMediaService;
    }

    public override void Configure()
    {
        Get("public/groups/pictures/{mediaItemId}/{rendition}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicGroupPictureRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = MediaFileResults.UncachedByTheEdge;
        var file = await _publicMediaService.GroupPictureFileAsync(
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

public sealed record GetPublicGroupPictureRequest
{
    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicGroupPictureValidator : Validator<GetPublicGroupPictureRequest>
{
    public GetPublicGroupPictureValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
