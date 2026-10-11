using System.Diagnostics.Contracts;
using Furria.Application.Media;

namespace Furria.Api.Media;

public static class MediaFileResults
{
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
