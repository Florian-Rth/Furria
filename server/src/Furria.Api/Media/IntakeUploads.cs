using Furria.Core.Media;
using Furria.Infrastructure.Media;
using tusdotnet;
using tusdotnet.Models;
using tusdotnet.Stores;

namespace Furria.Api.Media;

public static class IntakeUploads
{
    public const string UrlPath = "/api/media/intake-uploads";

    private const bool DeletePartialFilesOnConcat = true;

    public static WebApplication UseIntakeUploads(this WebApplication app)
    {
        app.UseWhen(
            http => http.Request.Path.StartsWithSegments(UrlPath),
            uploads =>
            {
                uploads.Use(IntakeUploadPasses.CaptureAsync);
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
                new PrefixedUploadIds(
                    PrefixedUploadIds.IntakePrefix,
                    IntakeUploadPasses.Of(http)?.IntakeId ?? 0
                )
            ),
            MaxAllowedUploadSizeInBytesLong = MediaLimits.MaxBytesOf(MediaKind.Photo),
            Events = new IntakeUploadEvents(http).ToEvents(),
        };
}
