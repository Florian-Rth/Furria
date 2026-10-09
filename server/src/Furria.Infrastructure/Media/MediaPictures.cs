using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Media;
using Furria.Core.Media;

namespace Furria.Infrastructure.Media;

public sealed class MediaPictures
{
    public const string PublicBoardPortraitRoute = "/api/public/board/portraits";
    public const string PublicGroupPictureRoute = "/api/public/groups/pictures";
    public const string PublicGalleryPhotoRoute = "/api/public/gallery/photos";

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

    public string? UncroppedUrlOf(MediaOwner owner, int mediaItemId, DateTimeOffset? renderedAt) =>
        renderedAt is { } rendered
            ? Versioned(_signer.UrlOf(mediaItemId, owner, MediaRendition.Uncropped), rendered)
            : null;

    [Pure]
    public static PictureDetails? PublicBoardPortraitOf(
        int? mediaItemId,
        DateTimeOffset? renderedAt
    ) =>
        PictureOf(
            mediaItemId,
            renderedAt,
            (id, rendition) => PublicUrlOf(PublicBoardPortraitRoute, id, rendition)
        );

    [Pure]
    public static PictureDetails? PublicGroupPictureOf(
        int? mediaItemId,
        DateTimeOffset? renderedAt
    ) =>
        PictureOf(
            mediaItemId,
            renderedAt,
            (id, rendition) => PublicUrlOf(PublicGroupPictureRoute, id, rendition)
        );

    [Pure]
    public static PictureDetails PublicGalleryPhotoOf(int mediaItemId) =>
        new()
        {
            SmallUrl = PublicUrlOf(PublicGalleryPhotoRoute, mediaItemId, MediaRendition.Small),
            MediumUrl = PublicUrlOf(PublicGalleryPhotoRoute, mediaItemId, MediaRendition.Medium),
            LargeUrl = PublicUrlOf(PublicGalleryPhotoRoute, mediaItemId, MediaRendition.Large),
        };

    private static PictureDetails? PictureOf(
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
    private static string PublicUrlOf(string route, int mediaItemId, MediaRendition rendition) =>
        $"{route}/{mediaItemId.ToString(CultureInfo.InvariantCulture)}/{MediaUrlSigner.WireNameOf(rendition)}";

    [Pure]
    private static string Versioned(string url, DateTimeOffset renderedAt) =>
        $"{url}{(url.Contains('?', StringComparison.Ordinal) ? '&' : '?')}v={renderedAt.ToUnixTimeMilliseconds().ToString(CultureInfo.InvariantCulture)}";
}
