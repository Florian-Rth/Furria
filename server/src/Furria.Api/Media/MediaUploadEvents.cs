using System.Globalization;
using System.Net;
using System.Text;
using Furria.Api.Authorization;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;

namespace Furria.Api.Media;

public sealed class MediaUploadEvents
{
    public const string OwnerMetadataKey = "owner";
    public const string FileNameMetadataKey = "filename";
    public const string AlbumMetadataKey = "album";
    public const string CropMetadataKey = "crop";
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
    private const string AlbumOfGalleryOnly = "Only a gallery upload goes into an album.";
    private const string AlbumUnknown = "There is no such album.";
    private const string CropRefused =
        "A crop is left, top, width and height as fractions of a portrait or group picture.";

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
        else if (!CropFits(owner.Value, TextOf(context.Metadata, CropMetadataKey)))
            context.FailRequest(HttpStatusCode.BadRequest, CropRefused);
        else if (context.UploadLength > owner.Value.MaxBytes)
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
        else if (!await FailsOnAccessAsync(context, owner.Value))
            await CheckAlbumAsync(context, owner.Value);
    }

    private async Task<bool> FailsOnAccessAsync(BeforeCreateContext context, MediaOwner owner)
    {
        var access = await Access()
            .MayUploadAsync(_accountId!.Value, owner, context.CancellationToken);
        FailOn(context, access);
        return !access.IsSuccess;
    }

    private async Task CheckAlbumAsync(BeforeCreateContext context, MediaOwner owner)
    {
        if (TextOf(context.Metadata, AlbumMetadataKey) is null)
            return;

        var albumId = AlbumIdOf(context.Metadata);
        if (owner.Kind != MediaOwnerKind.Gallery || albumId is null)
            context.FailRequest(HttpStatusCode.BadRequest, AlbumOfGalleryOnly);
        else if (
            !await _http
                .RequestServices.GetRequiredService<GalleryService>()
                .IsLiveAlbumAsync(albumId.Value, context.CancellationToken)
        )
            context.FailRequest(HttpStatusCode.NotFound, AlbumUnknown);
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
                    AlbumId = AlbumIdOf(metadata),
                    ByteSize = (
                        await context.Store.GetUploadLengthAsync(context.FileId, ct)
                    )!.Value,
                    UploadedByPersonId = await _http
                        .RequestServices.GetRequiredService<PermissionAuthorizer>()
                        .ActivePersonIdAsync(_accountId!.Value, ct),
                    Crop = PictureCrop.Parse(TextOf(metadata, CropMetadataKey)),
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

    private static bool CropFits(MediaOwner owner, string? crop) =>
        crop is null || (owner.PictureAspect is not null && PictureCrop.Parse(crop) is not null);

    private static string? FileNameOf(Dictionary<string, Metadata> metadata)
    {
        var fileName = Path.GetFileName(TextOf(metadata, FileNameMetadataKey)?.Trim());
        return string.IsNullOrEmpty(fileName) || fileName.Length > MediaItem.OriginalFileNameLength
            ? null
            : fileName;
    }

    private static int? AlbumIdOf(Dictionary<string, Metadata> metadata) =>
        int.TryParse(
            TextOf(metadata, AlbumMetadataKey),
            NumberStyles.None,
            CultureInfo.InvariantCulture,
            out var albumId
        )
        && albumId > 0
            ? albumId
            : null;

    private static string? TextOf(Dictionary<string, Metadata> metadata, string key) =>
        metadata.TryGetValue(key, out var value) && !value.HasEmptyValue
            ? value.GetString(Encoding.UTF8)
            : null;
}
