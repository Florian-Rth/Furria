using System.Net;
using Furria.Api.RateLimiting;
using Furria.Application.Gallery;
using Furria.Application.Media;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;

namespace Furria.Api.Media;

public sealed class LinkUploadEvents
{
    public const string UploaderNameMetadataKey = "name";

    private const string ConcatenationRefused = "Uploads are not concatenated.";
    private const string LengthRequired = "An upload declares its length up front.";
    private const string FileNameRequired = "An upload names its file.";
    private const string UploaderNameRefused = "An uploader's name is at most 60 characters.";
    private const string TooLarge = "The upload exceeds what the link accepts.";
    private const string LinkFull = "The link has taken all it holds.";
    private const string LinkEnded = "The link has ended.";
    private const string TooManyUploads = "Too many uploads from this address; try again later.";
    private const string NotAcceptedMedia =
        "Only photos (JPEG, HEIC, PNG, WebP) and videos (MP4, MOV) are accepted.";

    private readonly HttpContext _http;
    private readonly UploadLinkPass? _pass;

    public LinkUploadEvents(HttpContext http)
    {
        _http = http;
        _pass = LinkUploadPasses.Of(http);
    }

    public Events ToEvents() =>
        new()
        {
            OnAuthorizeAsync = AuthorizeAsync,
            OnBeforeCreateAsync = BeforeCreateAsync,
            OnBeforeWriteAsync = BeforeWriteAsync,
            OnFileCompleteAsync = FileCompleteAsync,
        };

    private Task AuthorizeAsync(AuthorizeContext context)
    {
        if (_pass is null)
            context.FailRequest(HttpStatusCode.NotFound);
        else if (context.Intent == IntentType.ConcatenateFiles)
            context.FailRequest(HttpStatusCode.BadRequest, ConcatenationRefused);
        else if (
            context.FileId is not null
            && LinkUploadIds.UploadLinkIdOf(context.FileId) != _pass.UploadLinkId
        )
            context.FailRequest(HttpStatusCode.NotFound);
        else if (!Admits(_pass.State, context.Intent))
            context.FailRequest(HttpStatusCode.Gone, LinkEnded);

        return Task.CompletedTask;
    }

    private Task BeforeCreateAsync(BeforeCreateContext context)
    {
        if (context.UploadLengthIsDeferred || context.UploadLength <= 0)
            context.FailRequest(HttpStatusCode.BadRequest, LengthRequired);
        else if (UploadMetadata.FileNameOf(context.Metadata) is null)
            context.FailRequest(HttpStatusCode.BadRequest, FileNameRequired);
        else if (!UploaderNameFits(context.Metadata))
            context.FailRequest(HttpStatusCode.BadRequest, UploaderNameRefused);
        else if (context.UploadLength > MediaLimits.MaxVideoBytes)
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
        else if (!_pass!.HasRoomFor(context.UploadLength))
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, LinkFull);
        else if (!RateLimiter().TryAcquire(_http.Connection.RemoteIpAddress))
            context.FailRequest(HttpStatusCode.TooManyRequests, TooManyUploads);

        return Task.CompletedTask;
    }

    private async Task BeforeWriteAsync(BeforeWriteContext context)
    {
        if (context.UploadOffset != 0)
            return;

        var format = MediaSniffer.Sniff(UploadHead.Of(_http));
        var length = await context.Store.GetUploadLengthAsync(
            context.FileId,
            context.CancellationToken
        );

        if (format is null || !Owner().Accepts(format.Kind))
            context.FailRequest(HttpStatusCode.UnsupportedMediaType, NotAcceptedMedia);
        else if (length > MediaLimits.MaxBytesOf(format.Kind))
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
    }

    private async Task FileCompleteAsync(FileCompleteContext context)
    {
        var ct = context.CancellationToken;
        var file = (await context.GetFileAsync())!;
        var metadata = await file.GetMetadataAsync(ct);

        await _http
            .RequestServices.GetRequiredService<MediaStore>()
            .AdoptAsync(
                new AdoptUploadCommand
                {
                    StagedFilePath = Path.Combine(StagingPath(), context.FileId),
                    Format = await UploadMetadata.FormatOfAsync(file, ct),
                    Owner = Owner(),
                    OriginalFileName = UploadMetadata.FileNameOf(metadata)!,
                    ByteSize = (
                        await context.Store.GetUploadLengthAsync(context.FileId, ct)
                    )!.Value,
                    UploadedByPersonId = null,
                    UploaderName = UploaderNameOf(metadata),
                },
                ct
            );

        await ((ITusTerminationStore)context.Store).DeleteFileAsync(context.FileId, ct);
    }

    private MediaOwner Owner() => MediaOwner.UploadLink(_pass!.UploadLinkId);

    private string StagingPath() =>
        _http.RequestServices.GetRequiredService<MediaRoot>().StagingPath;

    private LinkUploadRateLimiter RateLimiter() =>
        _http.RequestServices.GetRequiredService<LinkUploadRateLimiter>();

    private static bool Admits(UploadLinkState state, IntentType intent) =>
        intent == IntentType.CreateFile
            ? state == UploadLinkState.Open
            : state != UploadLinkState.Revoked;

    private static bool UploaderNameFits(Dictionary<string, Metadata> metadata) =>
        UploadMetadata.TextOf(metadata, UploaderNameMetadataKey) is not { } name
        || name.Trim().Length <= MediaItem.UploaderNameLength;

    private static string? UploaderNameOf(Dictionary<string, Metadata> metadata) =>
        UploadMetadata.TextOf(metadata, UploaderNameMetadataKey)?.Trim() is { Length: > 0 } name
            ? name
            : null;
}
