using System.Net;
using Furria.Api.RateLimiting;
using Furria.Application.Intakes;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;

namespace Furria.Api.Media;

public sealed class IntakeUploadEvents
{
    private const string ConcatenationRefused = "Uploads are not concatenated.";
    private const string LengthRequired = "An upload declares its length up front.";
    private const string FileNameRequired = "An upload names its file.";
    private const string CropRefused = "A crop is left, top, width and height as fractions.";
    private const string TooLarge = "The upload exceeds what a portrait may be.";
    private const string LinkEnded = "The link takes no portrait any more.";
    private const string TooManyUploads = "Too many uploads from this address; try again later.";
    private const string NotAcceptedMedia = "Only photos (JPEG, HEIC, PNG, WebP) are accepted.";

    private readonly HttpContext _http;
    private readonly IntakePortraitPass? _pass;

    public IntakeUploadEvents(HttpContext http)
    {
        _http = http;
        _pass = IntakeUploadPasses.Of(http);
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
            && PrefixedUploadIds.ScopeIdOf(PrefixedUploadIds.IntakePrefix, context.FileId)
                != _pass.IntakeId
        )
            context.FailRequest(HttpStatusCode.NotFound);
        else if (!_pass.IsOpen)
            context.FailRequest(HttpStatusCode.Gone, LinkEnded);

        return Task.CompletedTask;
    }

    private Task BeforeCreateAsync(BeforeCreateContext context)
    {
        var crop = UploadMetadata.TextOf(context.Metadata, MediaUploadEvents.CropMetadataKey);

        if (context.UploadLengthIsDeferred || context.UploadLength <= 0)
            context.FailRequest(HttpStatusCode.BadRequest, LengthRequired);
        else if (UploadMetadata.FileNameOf(context.Metadata) is null)
            context.FailRequest(HttpStatusCode.BadRequest, FileNameRequired);
        else if (crop is not null && PictureCrop.Parse(crop) is null)
            context.FailRequest(HttpStatusCode.BadRequest, CropRefused);
        else if (context.UploadLength > Owner().MaxBytes)
            context.FailRequest(HttpStatusCode.RequestEntityTooLarge, TooLarge);
        else if (!RateLimiter().TryAcquire(_http.Connection.RemoteIpAddress))
            context.FailRequest(HttpStatusCode.TooManyRequests, TooManyUploads);

        return Task.CompletedTask;
    }

    private Task BeforeWriteAsync(BeforeWriteContext context)
    {
        if (context.UploadOffset != 0)
            return Task.CompletedTask;

        var format = MediaSniffer.Sniff(UploadHead.Of(_http));
        if (format is null || !Owner().Accepts(format.Kind))
            context.FailRequest(HttpStatusCode.UnsupportedMediaType, NotAcceptedMedia);

        return Task.CompletedTask;
    }

    private async Task FileCompleteAsync(FileCompleteContext context)
    {
        var ct = context.CancellationToken;
        var store = (ITusTerminationStore)context.Store;
        try
        {
            await AdoptAsync(context, ct);
        }
        catch (MediaOwnerGoneException) { }

        await store.DeleteFileAsync(context.FileId, ct);
    }

    private async Task AdoptAsync(FileCompleteContext context, CancellationToken ct)
    {
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
                    Crop = PictureCrop.Parse(
                        UploadMetadata.TextOf(metadata, MediaUploadEvents.CropMetadataKey)
                    ),
                },
                ct
            );
    }

    private MediaOwner Owner() => MediaOwner.Intake(_pass!.IntakeId);

    private string StagingPath() =>
        _http.RequestServices.GetRequiredService<MediaRoot>().StagingPath;

    private LinkUploadRateLimiter RateLimiter() =>
        _http.RequestServices.GetRequiredService<LinkUploadRateLimiter>();
}
