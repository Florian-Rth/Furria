using System.Linq.Expressions;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const string UnknownAlbumMessage = "Dieses Album gibt es nicht.";
    private const string UnknownItemMessage = "Dieses Bild gibt es nicht in der Galerie.";

    private static readonly Expression<Func<MediaItem, GalleryItemSummary>> ItemSummary =
        item => new GalleryItemSummary
        {
            MediaItemId = item.Id,
            Kind = item.Kind,
            State = item.State,
            Width = item.Width,
            Height = item.Height,
            DurationSeconds = item.DurationSeconds,
            CapturedAt = item.CapturedAt,
            UploadedAt = item.UploadedAt,
            Camera = item.Camera,
            OriginalFileName = item.OriginalFileName,
            Uploader =
                item.UploadedBy == null
                    ? null
                    : new GalleryUploader(
                        item.UploadedBy.Id,
                        item.UploadedBy.FirstName,
                        item.UploadedBy.LastName
                    ),
            SelectionPosition = item.SelectionPosition,
            Caption = item.Caption,
        };

    private static readonly Expression<Func<MediaItem, bool>> IsPhoto = item =>
        item.Kind == MediaKind.Photo;

    private static readonly Expression<Func<MediaItem, bool>> IsVideo = item =>
        item.Kind == MediaKind.Video;

    private static readonly Expression<Func<MediaItem, bool>> IsSelected = item =>
        item.SelectionPosition != null;

    private readonly AppDbContext _dbContext;
    private readonly MediaFiles _mediaFiles;
    private readonly TimeProvider _timeProvider;

    public GalleryService(AppDbContext dbContext, MediaFiles mediaFiles, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _mediaFiles = mediaFiles;
        _timeProvider = timeProvider;
    }

    private IQueryable<Album> LiveAlbums() =>
        _dbContext.Albums.Where(album => album.BinnedAt == null);

    private IQueryable<MediaItem> GalleryItems() =>
        _dbContext.MediaItems.Where(item => item.OwnerKind == MediaOwnerKind.Gallery);

    private IQueryable<MediaItem> InboxItems() =>
        GalleryItems().Where(item => item.AlbumId == null);

    private IQueryable<MediaItem> LiveItemsOf(int albumId) =>
        _dbContext.MediaItems.Where(item => item.AlbumId == albumId && item.BinnedAt == null);
}
