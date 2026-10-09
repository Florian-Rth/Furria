using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.Api.Endpoints.Gallery;

public static class GalleryMediaUrls
{
    private const string DownloadFlag = "&download";

    public static GalleryMediaUrlsDto Of(MediaUrlSigner signer, int mediaItemId, MediaKind kind)
    {
        var original = UrlOf(signer, mediaItemId, MediaRendition.Original);

        return kind == MediaKind.Video
            ? new GalleryMediaUrlsDto
            {
                Small = UrlOf(signer, mediaItemId, MediaRendition.Small),
                Medium = null,
                Large = null,
                Poster = UrlOf(signer, mediaItemId, MediaRendition.Poster),
                Video = UrlOf(signer, mediaItemId, MediaRendition.Video),
                Original = original,
                Download = original + DownloadFlag,
            }
            : new GalleryMediaUrlsDto
            {
                Small = UrlOf(signer, mediaItemId, MediaRendition.Small),
                Medium = UrlOf(signer, mediaItemId, MediaRendition.Medium),
                Large = UrlOf(signer, mediaItemId, MediaRendition.Large),
                Poster = null,
                Video = null,
                Original = original,
                Download = original + DownloadFlag,
            };
    }

    private static string UrlOf(MediaUrlSigner signer, int mediaItemId, MediaRendition rendition) =>
        signer.UrlOf(mediaItemId, MediaOwner.Gallery, rendition);
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
