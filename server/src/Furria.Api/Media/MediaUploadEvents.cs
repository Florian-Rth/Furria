using System.Globalization;
using System.Net;
using System.Text;
using Furria.Api.Authorization;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Media;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;

namespace Furria.Api.Media;

public sealed class MediaUploadEvents
{
    public const string OwnerMetadataKey = "owner";
    public const string FileNameMetadataKey = "filename";
    public const string MediaItemIdHeader = "Media-Item-Id";

    private const string ConcatenationRefused = "Uploads are not concatenated.";
    private const string LengthRequired = "An upload declares its length up front.";
    private const string OwnerRequired =
        "An upload names its owner: gallery, person:{id} or group:{id}.";
    private const string FileNameRequired = "An upload names its file.";
    private const string TooLarge = "The upload exceeds what its owner accepts.";
    private const string NotAcceptedMedia =
        "Only photos (JPEG, HEIC, PNG, WebP) and videos (MP4, MOV) are accepted.";
    private const string NotAcceptedByOwner = "This owner accepts photos only.";

    private readonly HttpContext _http;
    private readonly int? _accountId;

    public MediaUploadEvents(HttpContext http)
    {
        _http = http;
        _accountId = http.User.AccountId();
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
        if (_accountId is null)
            context.FailRequest(HttpStatusCode.Unauthorized);
        else if (context.Intent == IntentType.ConcatenateFiles)
            context.FailRequest(HttpStatusCode.BadRequest, ConcatenationRefused);
        else if (
            context.FileId is not null
            && AccountUploadIds.AccountIdOf(context.FileId) != _accountId
        )
            context.FailRequest(HttpStatusCode.NotFound);

        return Task.CompletedTask;
    }

    private async Task BeforeCreateAsync(BeforeCreateContext context)
    {
        var owner = MediaOwner.Parse(TextOf(context.Metadata, OwnerMetadataKey));
        var fileName = FileNameOf(context.Metadata);

        if (context.UploadLengthIsDeferred || context.UploadLength <= 0)
            context.FailRequest(HttpStatusCode.BadRequest, LengthRequired);
        else if (owner is null)
            context.FailRequest(HttpStatusCode.BadRequest, OwnerRequired);
        else if (fileName is null)
            context.FailRequest(HttpStatusCode.BadRequest, FileNameRequired);
        else if (context.UploadLength > owner.Value.MaxBytes)
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
        else
            FailOn(
                context,
                await Access()
                    .MayUploadAsync(_accountId!.Value, owner.Value, context.CancellationToken)
            );
    }

    private async Task BeforeWriteAsync(BeforeWriteContext context)
    {
        if (context.UploadOffset != 0)
            return;

        var format = MediaSniffer.Sniff(UploadHead.Of(_http));
        var owner = await OwnerOfAsync(context);
        var length = await context.Store.GetUploadLengthAsync(
            context.FileId,
            context.CancellationToken
        );

        if (format is null)
            context.FailRequest(HttpStatusCode.UnsupportedMediaType, NotAcceptedMedia);
        else if (!owner.Accepts(format.Kind))
            context.FailRequest(HttpStatusCode.UnsupportedMediaType, NotAcceptedByOwner);
        else if (length > MediaLimits.MaxBytesOf(format.Kind))
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
    }

    private async Task FileCompleteAsync(FileCompleteContext context)
    {
        var ct = context.CancellationToken;
        var file = (await context.GetFileAsync())!;
        var metadata = await file.GetMetadataAsync(ct);

        var mediaItemId = await _http
            .RequestServices.GetRequiredService<MediaStore>()
            .AdoptAsync(
                new AdoptUploadCommand
                {
                    StagedFilePath = Path.Combine(StagingPath(), context.FileId),
                    Format = await FormatOfAsync(file, ct),
                    Owner = MediaOwner.Parse(TextOf(metadata, OwnerMetadataKey))!.Value,
                    OriginalFileName = FileNameOf(metadata)!,
                    ByteSize = (
                        await context.Store.GetUploadLengthAsync(context.FileId, ct)
                    )!.Value,
                    UploadedByPersonId = await _http
                        .RequestServices.GetRequiredService<PermissionAuthorizer>()
                        .ActivePersonIdAsync(_accountId!.Value, ct),
                },
                ct
            );

        await ((ITusTerminationStore)context.Store).DeleteFileAsync(context.FileId, ct);
        _http.Response.Headers[MediaItemIdHeader] = mediaItemId.ToString(
            CultureInfo.InvariantCulture
        );
    }

    private MediaOwnerAccess Access() =>
        _http.RequestServices.GetRequiredService<MediaOwnerAccess>();

    private string StagingPath() =>
        _http.RequestServices.GetRequiredService<MediaRoot>().StagingPath;

    private static async Task<MediaOwner> OwnerOfAsync(BeforeWriteContext context)
    {
        var file = (await context.GetFileAsync())!;
        var metadata = await file.GetMetadataAsync(context.CancellationToken);
        return MediaOwner.Parse(TextOf(metadata, OwnerMetadataKey))!.Value;
    }

    private static async Task<MediaFormat> FormatOfAsync(ITusFile file, CancellationToken ct)
    {
        await using var content = await file.GetContentAsync(ct);
        return MediaSniffer.Sniff(await UploadHead.ReadHeadAsync(content, ct))
            ?? throw new InvalidOperationException(
                "A completed upload was sniffed on its first chunk and must still be media."
            );
    }

    private static void FailOn(BeforeCreateContext context, Result access)
    {
        if (access.IsSuccess)
            return;

        context.FailRequest(
            access.Error.Kind == ResultErrorKind.NotFound
                ? HttpStatusCode.NotFound
                : HttpStatusCode.Forbidden,
            access.Error.Message
        );
    }

    private static string? FileNameOf(Dictionary<string, Metadata> metadata)
    {
        var fileName = Path.GetFileName(TextOf(metadata, FileNameMetadataKey)?.Trim());
        return string.IsNullOrEmpty(fileName) || fileName.Length > MediaItem.OriginalFileNameLength
            ? null
            : fileName;
    }

    private static string? TextOf(Dictionary<string, Metadata> metadata, string key) =>
        metadata.TryGetValue(key, out var value) && !value.HasEmptyValue
            ? value.GetString(Encoding.UTF8)
            : null;
}
