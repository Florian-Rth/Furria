using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Public;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.Media;

public sealed class GetPublicPicture : Endpoint<GetPublicPictureRequest>
{
    private static readonly string UncachedByTheEdge = new CacheControlHeaderValue
    {
        Private = true,
        NoCache = true,
    }.ToString();

    private readonly PublicPictures _publicPictures;

    public GetPublicPicture(PublicPictures publicPictures)
    {
        _publicPictures = publicPictures;
    }

    public override void Configure()
    {
        Get(PublicPictures.Route);
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicPictureRequest req, CancellationToken ct)
    {
        HttpContext.Response.Headers.CacheControl = UncachedByTheEdge;
        var file = await _publicPictures.FileAsync(req.Kind, req.MediaItemId, req.Rendition, ct);
        if (file is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.ResultAsync(MediaFileResults.Of(file, asDownload: false));
    }
}

public sealed record GetPublicPictureRequest
{
    [RouteParam]
    public required string Kind { get; init; }

    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }
}

public sealed class GetPublicPictureValidator : Validator<GetPublicPictureRequest>
{
    public GetPublicPictureValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
