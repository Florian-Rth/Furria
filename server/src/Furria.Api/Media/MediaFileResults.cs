using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Microsoft.Net.Http.Headers;

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

    [Pure]
    public static IResult Of(MediaFileDetails file, EntityTagHeaderValue entityTag) =>
        TypedResults.PhysicalFile(
            file.FullPath,
            file.ContentType,
            fileDownloadName: null,
            file.LastModified,
            entityTag,
            enableRangeProcessing: true
        );
}
