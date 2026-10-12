using System.Linq.Expressions;
using Furria.Core.Media;

namespace Furria.Infrastructure.Gallery;

public static class GalleryPicks
{
    public static readonly Expression<Func<MediaItem, bool>> IsPickablePhoto = item =>
        item.OwnerKind == MediaOwnerKind.Gallery
        && item.Kind == MediaKind.Photo
        && item.State == MediaItemState.Ready
        && item.AlbumId != null
        && item.BinnedAt == null
        && item.Album!.BinnedAt == null;
}
