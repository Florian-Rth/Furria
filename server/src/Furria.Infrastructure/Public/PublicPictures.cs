using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Public;

public sealed class PublicPictures
{
    public const string Route = "public/{kind}/pictures/{mediaItemId}/{rendition}";

    private const string ApiRoot = "/api/";

    private static readonly FrozenSet<MediaRendition> ServedRenditions = new[]
    {
        MediaRendition.Small,
        MediaRendition.Medium,
        MediaRendition.Large,
    }.ToFrozenSet();

    private static readonly FrozenDictionary<PublicPictureKind, PublicPictureRoute> Routes =
        new Dictionary<PublicPictureKind, PublicPictureRoute>
        {
            [PublicPictureKind.BoardPortrait] = new(
                "board",
                face => face.BoardSeats.Select(seat => seat.Person!.PortraitId)
            ),
            [PublicPictureKind.GroupPicture] = new(
                "groups",
                face => face.Groups.Select(group => group.PictureId)
            ),
            [PublicPictureKind.GalleryPhoto] = new(
                "gallery",
                face => face.SelectedPhotos.Select(item => (int?)item.Id)
            ),
            [PublicPictureKind.NewsPicture] = new(
                "news",
                face => face.NewsPosts.Select(post => post.PictureId)
            ),
        }.ToFrozenDictionary();

    private static readonly FrozenDictionary<string, PublicPictureRoute> RoutesBySegment =
        Routes.Values.ToFrozenDictionary(route => route.Segment, StringComparer.Ordinal);

    private readonly PublicFace _publicFace;
    private readonly MediaStore _mediaStore;

    public PublicPictures(PublicFace publicFace, MediaStore mediaStore)
    {
        _publicFace = publicFace;
        _mediaStore = mediaStore;
    }

    public async Task<MediaFileDetails?> FileAsync(
        string kind,
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) =>
        RoutesBySegment.TryGetValue(kind, out var route)
        && ServedRenditions.Contains(rendition)
        && await route.ShownPictureIds(_publicFace).AnyAsync(id => id == mediaItemId, ct)
            ? await _mediaStore.FileOfAsync(mediaItemId, rendition, ct)
            : null;

    [Pure]
    public static PictureDetails? Of(
        PublicPictureKind kind,
        int? mediaItemId,
        DateTimeOffset? renderedAt
    ) =>
        MediaPictures.PictureOf(
            mediaItemId,
            renderedAt,
            (id, rendition) => UrlOf(kind, id, rendition)
        );

    [Pure]
    public static PictureDetails PhotoOf(int mediaItemId, DateTimeOffset? renderedAt) =>
        new()
        {
            SmallUrl = PhotoUrlOf(mediaItemId, MediaRendition.Small, renderedAt),
            MediumUrl = PhotoUrlOf(mediaItemId, MediaRendition.Medium, renderedAt),
            LargeUrl = PhotoUrlOf(mediaItemId, MediaRendition.Large, renderedAt),
        };

    [Pure]
    private static string PhotoUrlOf(
        int mediaItemId,
        MediaRendition rendition,
        DateTimeOffset? renderedAt
    ) =>
        MediaUrlVersions.Versioned(
            UrlOf(PublicPictureKind.GalleryPhoto, mediaItemId, rendition),
            renderedAt
        );

    [Pure]
    private static string UrlOf(
        PublicPictureKind kind,
        int mediaItemId,
        MediaRendition rendition
    ) =>
        ApiRoot
        + Route
            .Replace("{kind}", Routes[kind].Segment, StringComparison.Ordinal)
            .Replace(
                "{mediaItemId}",
                mediaItemId.ToString(CultureInfo.InvariantCulture),
                StringComparison.Ordinal
            )
            .Replace("{rendition}", MediaUrlSigner.WireNameOf(rendition), StringComparison.Ordinal);

    private sealed record PublicPictureRoute(
        string Segment,
        Func<PublicFace, IQueryable<int?>> ShownPictureIds
    );
}
