using FastEndpoints;
using FluentValidation;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.Media;

public sealed class GetMediaRendition : Endpoint<GetMediaRenditionRequest>
{
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
        var file = await _mediaStore.FileOfAsync(req.MediaItemId, req.Rendition, ct);
        if (file is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        if (!_signer.Verifies(ToQuery(req, file.Owner)))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        HttpContext.Response.Headers.CacheControl = CacheControlUntil(req.Exp);
        await Send.ResultAsync(
            TypedResults.PhysicalFile(
                file.FullPath,
                file.ContentType,
                req.Download is null ? null : file.DownloadName,
                file.LastModified,
                enableRangeProcessing: true
            )
        );
    }

    private string CacheControlUntil(long expiresAt) =>
        new CacheControlHeaderValue
        {
            Private = true,
            MaxAge = TimeSpan.FromSeconds(
                Math.Max(0, expiresAt - _timeProvider.GetUtcNow().ToUnixTimeSeconds())
            ),
        }.ToString();

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
