using Furria.Core.Media;
using Furria.Infrastructure.Media;
using tusdotnet;
using tusdotnet.Models;
using tusdotnet.Stores;

namespace Furria.Api.Media;

public static class LinkUploads
{
    public const string UrlPath = "/api/media/link-uploads";

    private const bool DeletePartialFilesOnConcat = true;

    public static WebApplication UseLinkUploads(this WebApplication app)
    {
        app.UseWhen(
            http => http.Request.Path.StartsWithSegments(UrlPath),
            uploads =>
            {
                uploads.Use(LinkUploadPasses.CaptureAsync);
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
                new LinkUploadIds(LinkUploadPasses.Of(http)?.UploadLinkId ?? 0)
            ),
            MaxAllowedUploadSizeInBytesLong = MediaLimits.MaxVideoBytes,
            Events = new LinkUploadEvents(http).ToEvents(),
        };
}
