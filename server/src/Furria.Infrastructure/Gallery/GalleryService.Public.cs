using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const int ChosenCoverRank = 0;
    private const int OtherCoverRank = 1;

    public async Task<IReadOnlyList<PublicGallerySection>> GetPublicGalleryAsync(
        CancellationToken ct
    )
    {
        var albums = await PublicAlbumCardsOf(_publicFace.Albums).ToListAsync(ct);
        var sessionNumbers = await _dbContext.SessionNumbersAsync(ct);

        return PublicSectionsOf([.. albums.Where(album => album.PhotoCount > 0)], sessionNumbers);
    }

    public async Task<PublicAlbumDetails?> GetPublicAlbumAsync(int albumId, CancellationToken ct)
    {
        var album = await PublicAlbumRowsOf(_publicFace.Albums.Where(row => row.Id == albumId))
            .SingleOrDefaultAsync(ct);
        var photos = await PublicPhotoRowsOf(
                _publicFace.SelectedPhotos.Where(item => item.AlbumId == albumId)
            )
            .ToListAsync(ct);
        if (album is not { SessionStartYear: { } sessionStartYear } || photos.Count == 0)
            return null;

        var sessionNumbers = await _dbContext.SessionNumbersAsync(ct);
        return new PublicAlbumDetails
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            Description = album.Description,
            EntryStartsAt = album.EntryStartsAt,
            SessionStartYear = sessionStartYear,
            SessionNumber = sessionNumbers.Of(sessionStartYear),
            Photos = [.. photos.OrderBy(photo => photo.Position).Select(ToPublicPhoto)],
        };
    }

    private static IQueryable<PublicAlbumRow> PublicAlbumRowsOf(IQueryable<Album> albums) =>
        albums.Select(album => new PublicAlbumRow(
            album.Id,
            album.Title,
            album.Description,
            album.CalendarEntry == null ? null : album.CalendarEntry.StartsAt,
            album.SessionStartYear
        ));

    private static IQueryable<PublicAlbumCardRow> PublicAlbumCardsOf(IQueryable<Album> albums) =>
        albums.Select(album => new PublicAlbumCardRow(
            album.Id,
            album.Title,
            album.CalendarEntry == null ? null : album.CalendarEntry.StartsAt,
            album.SessionStartYear,
            album.Items.AsQueryable().Count(PublicFace.IsSelectedPhoto),
            album
                .Items.AsQueryable()
                .Where(PublicFace.IsSelectedPhoto)
                .OrderBy(item =>
                    item.Id == album.CoverMediaItemId ? ChosenCoverRank : OtherCoverRank
                )
                .ThenBy(item => item.SelectionPosition)
                .Select(item => new PublicPhotoRow(
                    item.AlbumId!.Value,
                    item.Id,
                    item.SelectionPosition!.Value,
                    item.Width ?? 0,
                    item.Height ?? 0,
                    item.Caption,
                    item.RenderedAt
                ))
                .FirstOrDefault()
        ));

    private static IQueryable<PublicPhotoRow> PublicPhotoRowsOf(IQueryable<MediaItem> items) =>
        items.Select(item => new PublicPhotoRow(
            item.AlbumId!.Value,
            item.Id,
            item.SelectionPosition!.Value,
            item.Width ?? 0,
            item.Height ?? 0,
            item.Caption,
            item.RenderedAt
        ));

    [Pure]
    private static IReadOnlyList<PublicGallerySection> PublicSectionsOf(
        IReadOnlyList<PublicAlbumCardRow> albums,
        SessionNumbers sessionNumbers
    ) =>
        [
            .. SessionSections
                .DatedOf(
                    albums,
                    album => SessionDate.In(album.SessionStartYear),
                    sessionNumbers,
                    section =>
                        section
                            .OrderBy(album => album.EntryStartsAt is null)
                            .ThenByDescending(album => album.EntryStartsAt)
                            .ThenByDescending(album => album.AlbumId)
                )
                .Select(section => new PublicGallerySection
                {
                    SessionStartYear = section.SessionStartYear,
                    SessionNumber = section.SessionNumber,
                    Albums = [.. section.Items.Select(PublicSummaryOf)],
                }),
        ];

    [Pure]
    private static PublicAlbumSummary PublicSummaryOf(PublicAlbumCardRow album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            EntryStartsAt = album.EntryStartsAt,
            PhotoCount = album.PhotoCount,
            Cover = ToPublicPhoto(album.Cover!),
        };

    [Pure]
    private static PublicGalleryPhoto ToPublicPhoto(PublicPhotoRow photo) =>
        new()
        {
            MediaItemId = photo.MediaItemId,
            Width = photo.Width,
            Height = photo.Height,
            Caption = photo.Caption,
            Picture = PublicPictures.PhotoOf(photo.MediaItemId, photo.RenderedAt),
        };

    private sealed record PublicAlbumRow(
        int AlbumId,
        string Title,
        string? Description,
        DateTimeOffset? EntryStartsAt,
        int? LinkedSessionStartYear
    )
    {
        public int? SessionStartYear => AlbumSession.YearOf(EntryStartsAt, LinkedSessionStartYear);
    }

    private sealed record PublicAlbumCardRow(
        int AlbumId,
        string Title,
        DateTimeOffset? EntryStartsAt,
        int? LinkedSessionStartYear,
        int PhotoCount,
        PublicPhotoRow? Cover
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
        string? Caption,
        DateTimeOffset? RenderedAt
    );
}
