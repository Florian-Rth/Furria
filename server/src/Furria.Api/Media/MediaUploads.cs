using Furria.Api.Authorization;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using tusdotnet;
using tusdotnet.Models;
using tusdotnet.Stores;

namespace Furria.Api.Media;

public static class MediaUploads
{
    public const string UrlPath = "/api/media/uploads";

    private const bool DeletePartialFilesOnConcat = true;

    public static WebApplication UseMediaUploads(this WebApplication app)
    {
        app.Services.GetRequiredService<MediaRoot>().PrepareStaging();
        app.UseWhen(
            http => http.Request.Path.StartsWithSegments(UrlPath),
            uploads =>
            {
                uploads.Use(UploadHead.CaptureAsync);
                uploads.UseTus(ConfigurationFor);
            }
        );
        return app;
    }

    private static DefaultTusConfiguration ConfigurationFor(HttpContext http) =>
        new()
        {
            UrlPath = UrlPath,
            Store = new TusDiskStore(
                http.RequestServices.GetRequiredService<MediaRoot>().StagingPath,
                DeletePartialFilesOnConcat,
                TusDiskBufferSize.Default,
                new AccountUploadIds(http.User.AccountId() ?? 0)
            ),
            MaxAllowedUploadSizeInBytesLong = MediaLimits.MaxVideoBytes,
            Events = new MediaUploadEvents(http).ToEvents(),
        };
}
