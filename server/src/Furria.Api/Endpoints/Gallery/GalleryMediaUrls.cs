using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public static class GalleryMediaUrls
{
    private const string DownloadFlag = "&download";

    public static GalleryMediaUrlsDto Of(
        MediaUrlSigner signer,
        int mediaItemId,
        MediaKind kind,
        DateTimeOffset? renderedAt
    )
    {
        string? UrlOf(MediaRendition rendition) =>
            MediaRenditions.Exists(kind, rendition)
                ? MediaUrlVersions.Versioned(
                    signer.UrlOf(mediaItemId, MediaOwner.Gallery, rendition),
                    renderedAt
                )
                : null;

        var original = UrlOf(MediaRendition.Original)!;

        return new GalleryMediaUrlsDto
        {
            Small = UrlOf(MediaRendition.Small)!,
            Medium = UrlOf(MediaRendition.Medium),
            Large = UrlOf(MediaRendition.Large),
            Poster = UrlOf(MediaRendition.Poster),
            Video = UrlOf(MediaRendition.Video),
            Original = original,
            Download = original + DownloadFlag,
        };
    }
}

public sealed record GalleryMediaUrlsDto
{
    public required string Small { get; init; }

    public required string? Medium { get; init; }

    public required string? Large { get; init; }

    public required string? Poster { get; init; }

    public required string? Video { get; init; }

    public required string Original { get; init; }

    public required string Download { get; init; }
}
