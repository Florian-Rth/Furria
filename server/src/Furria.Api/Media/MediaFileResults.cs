using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Media;

public static class MediaFileResults
{
    public static readonly string UncachedByTheEdge = new CacheControlHeaderValue
    {
        Private = true,
        NoCache = true,
    }.ToString();

    [Pure]
    public static IResult Of(MediaFileDetails file, bool asDownload) =>
        TypedResults.PhysicalFile(
            file.FullPath,
            file.ContentType,
            asDownload ? file.DownloadName : null,
            file.LastModified,
            enableRangeProcessing: true
        );
}
