using System.Linq.Expressions;
using Furria.Core.Gallery;
using Furria.Core.Media;

namespace Furria.Infrastructure.Gallery;

public static class PublicGallery
{
    public static readonly Expression<Func<Album, bool>> IsPublished = album =>
        album.PublishedAt != null && album.BinnedAt == null;

    public static readonly Expression<Func<MediaItem, bool>> IsInAPublicSelection = item =>
        item.OwnerKind == MediaOwnerKind.Gallery
        && item.Kind == MediaKind.Photo
        && item.State == MediaItemState.Ready
        && item.BinnedAt == null
        && item.SelectionPosition != null
        && item.Album!.PublishedAt != null
        && item.Album.BinnedAt == null;
}
