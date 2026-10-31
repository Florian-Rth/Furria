using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Api.Results;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.Media;

public sealed class GetMediaRendition : Endpoint<GetMediaRenditionRequest>
{
    private const string ImmutableDirective = "immutable";

    private static readonly string AskAgainCacheControl = new CacheControlHeaderValue
    {
        Private = true,
        NoCache = true,
    }.ToString();

    private readonly MediaStore _mediaStore;
    private readonly MediaUrlSigner _signer;
    private readonly TimeProvider _timeProvider;

    public GetMediaRendition(
        MediaStore mediaStore,
        MediaUrlSigner signer,
        TimeProvider timeProvider
    )
    {
        _mediaStore = mediaStore;
        _signer = signer;
        _timeProvider = timeProvider;
    }

    public override void Configure()
    {
        Get("media/{mediaItemId}/{rendition}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetMediaRenditionRequest req, CancellationToken ct)
    {
        var lookup = await _mediaStore.FileOfAsync(
            req.MediaItemId,
            req.Rendition,
            owner => _signer.Verifies(ToQuery(req, owner)),
            ct
        );
        if (!lookup.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(lookup.Error, ct);
            return;
        }

        var file = lookup.Value;

        HttpContext.Response.Headers.CacheControl = file.IsStandIn
            ? AskAgainCacheControl
            : CacheControlUntil(req.Exp);
        await Send.ResultAsync(MediaFileResults.Of(file, asDownload: req.Download is not null));
    }

    private string CacheControlUntil(long expiresAt)
    {
        var cacheControl = new CacheControlHeaderValue
        {
            Private = true,
            MaxAge = TimeSpan.FromSeconds(
                Math.Max(0, expiresAt - _timeProvider.GetUtcNow().ToUnixTimeSeconds())
            ),
        };
        cacheControl.Extensions.Add(new NameValueHeaderValue(ImmutableDirective));
        return cacheControl.ToString();
    }

    private static MediaUrlQuery ToQuery(GetMediaRenditionRequest req, MediaOwner owner) =>
        new()
        {
            MediaItemId = req.MediaItemId,
            Owner = owner,
            Rendition = req.Rendition,
            ExpiresAt = req.Exp,
            Signature = req.Sig,
        };
}

public sealed record GetMediaRenditionRequest
{
    [RouteParam]
    public required int MediaItemId { get; init; }

    [RouteParam]
    public required MediaRendition Rendition { get; init; }

    [QueryParam]
    public long Exp { get; init; }

    [QueryParam]
    public string Sig { get; init; } = "";

    [QueryParam]
    public string? Download { get; init; }
}

public sealed class GetMediaRenditionValidator : Validator<GetMediaRenditionRequest>
{
    public GetMediaRenditionValidator()
    {
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}
