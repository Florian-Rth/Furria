using System.Diagnostics.Contracts;
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

    public PictureDetails GalleryPhotoOf(int mediaItemId, DateTimeOffset? renderedAt) =>
        new()
        {
            SmallUrl = GalleryUrlOf(mediaItemId, MediaRendition.Small, renderedAt),
            MediumUrl = GalleryUrlOf(mediaItemId, MediaRendition.Medium, renderedAt),
            LargeUrl = GalleryUrlOf(mediaItemId, MediaRendition.Large, renderedAt),
        };

    public PictureEditingDetails EditingOf(
        MediaOwner owner,
        MediaPictureRow picture,
        IReadOnlySet<int> stalledIds
    ) =>
        new()
        {
            State = picture.State,
            IsStalled = stalledIds.Contains(picture.MediaItemId),
            Picture = Of(owner, picture.MediaItemId, picture.RenderedAt),
            UncroppedUrl = UncroppedUrlOf(owner, picture.MediaItemId, picture.RenderedAt),
            Crop = picture.Crop is { } crop ? MediaCrops.ToDetails(crop) : null,
        };

    public string? UncroppedUrlOf(MediaOwner owner, int mediaItemId, DateTimeOffset? renderedAt) =>
        renderedAt is { } rendered
            ? MediaUrlVersions.Versioned(
                _signer.UrlOf(mediaItemId, owner, MediaRendition.Uncropped),
                rendered
            )
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
                SmallUrl = MediaUrlVersions.Versioned(urlOf(id, MediaRendition.Small), rendered),
                MediumUrl = MediaUrlVersions.Versioned(urlOf(id, MediaRendition.Medium), rendered),
                LargeUrl = MediaUrlVersions.Versioned(urlOf(id, MediaRendition.Large), rendered),
            }
            : null;

    private string GalleryUrlOf(
        int mediaItemId,
        MediaRendition rendition,
        DateTimeOffset? renderedAt
    ) =>
        MediaUrlVersions.Versioned(
            _signer.UrlOf(mediaItemId, MediaOwner.Gallery, rendition),
            renderedAt
        );
}
