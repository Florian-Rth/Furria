using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Media;
using Furria.Core.Media;

namespace Furria.Infrastructure.Media;

public sealed class MediaPictures
{
    private readonly MediaUrlSigner _signer;

    public MediaPictures(MediaUrlSigner signer)
    {
        _signer = signer;
    }

    public PictureDetails? PortraitOf(int personId, int? mediaItemId, DateTimeOffset? renderedAt) =>
        Of(MediaOwner.Person(personId), mediaItemId, renderedAt);

    public PictureDetails? GroupPictureOf(
        int groupId,
        int? mediaItemId,
        DateTimeOffset? renderedAt
    ) => Of(MediaOwner.Group(groupId), mediaItemId, renderedAt);

    public PictureDetails? Of(MediaOwner owner, int? mediaItemId, DateTimeOffset? renderedAt) =>
        PictureOf(mediaItemId, renderedAt, (id, rendition) => _signer.UrlOf(id, owner, rendition));

    public PictureDetails GalleryPhotoOf(int mediaItemId) =>
        new()
        {
            SmallUrl = _signer.UrlOf(mediaItemId, MediaOwner.Gallery, MediaRendition.Small),
            MediumUrl = _signer.UrlOf(mediaItemId, MediaOwner.Gallery, MediaRendition.Medium),
            LargeUrl = _signer.UrlOf(mediaItemId, MediaOwner.Gallery, MediaRendition.Large),
        };

    public PictureEditingDetails EditingOf(MediaOwner owner, MediaPictureRow picture) =>
        new()
        {
            State = picture.State,
            Picture = Of(owner, picture.MediaItemId, picture.RenderedAt),
            UncroppedUrl = UncroppedUrlOf(owner, picture.MediaItemId, picture.RenderedAt),
            Crop = picture.Crop is { } crop ? MediaCrops.ToDetails(crop) : null,
        };

    public string? UncroppedUrlOf(MediaOwner owner, int mediaItemId, DateTimeOffset? renderedAt) =>
        renderedAt is { } rendered
            ? Versioned(_signer.UrlOf(mediaItemId, owner, MediaRendition.Uncropped), rendered)
            : null;

    [Pure]
    internal static PictureDetails? PictureOf(
        int? mediaItemId,
        DateTimeOffset? renderedAt,
        Func<int, MediaRendition, string> urlOf
    ) =>
        (mediaItemId, renderedAt) is ({ } id, { } rendered)
            ? new PictureDetails
            {
                SmallUrl = Versioned(urlOf(id, MediaRendition.Small), rendered),
                MediumUrl = Versioned(urlOf(id, MediaRendition.Medium), rendered),
                LargeUrl = Versioned(urlOf(id, MediaRendition.Large), rendered),
            }
            : null;

    [Pure]
    private static string Versioned(string url, DateTimeOffset renderedAt) =>
        $"{url}{(url.Contains('?', StringComparison.Ordinal) ? '&' : '?')}v={renderedAt.ToUnixTimeMilliseconds().ToString(CultureInfo.InvariantCulture)}";
}
