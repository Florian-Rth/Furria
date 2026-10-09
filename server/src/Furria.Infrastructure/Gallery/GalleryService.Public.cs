using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    public async Task<IReadOnlyList<PublicGallerySection>> GetPublicGalleryAsync(
        CancellationToken ct
    )
    {
        var albums = await PublicAlbumRowsOf(_dbContext.Albums).ToListAsync(ct);
        var photos = (await PublicPhotoRowsOf(_dbContext.MediaItems).ToListAsync(ct)).ToLookup(
            photo => photo.AlbumId
        );
        var sessionNumbers = await SessionNumbersAsync(ct);

        return PublicSectionsOf(
            [.. albums.Where(album => photos[album.AlbumId].Any())],
            photos,
            sessionNumbers
        );
    }

    public async Task<PublicAlbumDetails?> GetPublicAlbumAsync(int albumId, CancellationToken ct)
    {
        var album = await PublicAlbumRowsOf(_dbContext.Albums.Where(row => row.Id == albumId))
            .SingleOrDefaultAsync(ct);
        var photos = await PublicPhotoRowsOf(
                _dbContext.MediaItems.Where(item => item.AlbumId == albumId)
            )
            .ToListAsync(ct);
        if (album is not { SessionStartYear: { } sessionStartYear } || photos.Count == 0)
            return null;

        var sessionNumbers = await SessionNumbersAsync(ct);
        return new PublicAlbumDetails
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            Description = album.Description,
            EntryStartsAt = album.EntryStartsAt,
            SessionStartYear = sessionStartYear,
            SessionNumber = sessionNumbers.GetValueOrDefault(sessionStartYear),
            Photos = [.. photos.OrderBy(photo => photo.Position).Select(ToPublicPhoto)],
        };
    }

    private static IQueryable<PublicAlbumRow> PublicAlbumRowsOf(IQueryable<Album> albums) =>
        albums
            .AsNoTracking()
            .Where(PublicGallery.IsPublished)
            .Select(album => new PublicAlbumRow(
                album.Id,
                album.Title,
                album.Description,
                album.CalendarEntry == null ? null : album.CalendarEntry.StartsAt,
                album.SessionStartYear,
                album.CoverMediaItemId
            ));

    private static IQueryable<PublicPhotoRow> PublicPhotoRowsOf(IQueryable<MediaItem> items) =>
        items
            .AsNoTracking()
            .Where(PublicGallery.IsInAPublicSelection)
            .Select(item => new PublicPhotoRow(
                item.AlbumId!.Value,
                item.Id,
                item.SelectionPosition!.Value,
                item.Width ?? 0,
                item.Height ?? 0,
                item.Caption
            ));

    [Pure]
    private static IReadOnlyList<PublicGallerySection> PublicSectionsOf(
        IReadOnlyList<PublicAlbumRow> albums,
        ILookup<int, PublicPhotoRow> photos,
        IReadOnlyDictionary<int, int?> sessionNumbers
    ) =>
        [
            .. albums
                .Where(album => album.SessionStartYear is not null)
                .GroupBy(album => album.SessionStartYear!.Value)
                .OrderByDescending(section => section.Key)
                .Select(section => new PublicGallerySection
                {
                    SessionStartYear = section.Key,
                    SessionNumber = sessionNumbers.GetValueOrDefault(section.Key),
                    Albums =
                    [
                        .. section
                            .OrderBy(album => album.EntryStartsAt is null)
                            .ThenByDescending(album => album.EntryStartsAt)
                            .ThenByDescending(album => album.AlbumId)
                            .Select(album => PublicSummaryOf(album, [.. photos[album.AlbumId]])),
                    ],
                }),
        ];

    [Pure]
    private static PublicAlbumSummary PublicSummaryOf(
        PublicAlbumRow album,
        IReadOnlyList<PublicPhotoRow> photos
    ) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            EntryStartsAt = album.EntryStartsAt,
            PhotoCount = photos.Count,
            Cover = ToPublicPhoto(PublicCoverOf(album.CoverMediaItemId, photos)),
        };

    [Pure]
    private static PublicPhotoRow PublicCoverOf(
        int? chosenId,
        IReadOnlyList<PublicPhotoRow> photos
    ) =>
        photos.FirstOrDefault(photo => photo.MediaItemId == chosenId)
        ?? photos.MinBy(photo => photo.Position)!;

    [Pure]
    private static PublicGalleryPhoto ToPublicPhoto(PublicPhotoRow photo) =>
        new()
        {
            MediaItemId = photo.MediaItemId,
            Width = photo.Width,
            Height = photo.Height,
            Caption = photo.Caption,
            Picture = MediaPictures.PublicGalleryPhotoOf(photo.MediaItemId),
        };

    private sealed record PublicAlbumRow(
        int AlbumId,
        string Title,
        string? Description,
        DateTimeOffset? EntryStartsAt,
        int? LinkedSessionStartYear,
        int? CoverMediaItemId
    )
    {
        public int? SessionStartYear => AlbumSession.YearOf(EntryStartsAt, LinkedSessionStartYear);
    }

    private sealed record PublicPhotoRow(
        int AlbumId,
        int MediaItemId,
        int Position,
        int Width,
        int Height,
        string? Caption
    );
}
