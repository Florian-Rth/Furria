using System.Linq.Expressions;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public static class AlbumCovers
{
    private const int ChosenRank = 0;
    private const int SelectedRank = 1;
    private const int OtherRank = 2;

    private static readonly Expression<Func<Album, AlbumCoverRow>> CoverRow = album =>
        new(
            album.Id,
            album
                .Items.Where(item => item.BinnedAt == null)
                .OrderBy(item =>
                    item.Id == album.CoverMediaItemId ? ChosenRank
                    : item.SelectionPosition != null ? SelectedRank
                    : OtherRank
                )
                .ThenBy(item => item.SelectionPosition)
                .ThenBy(item => item.CapturedAt ?? item.UploadedAt)
                .ThenBy(item => item.Id)
                .Select(item => new GalleryMediaRef
                {
                    MediaItemId = item.Id,
                    Kind = item.Kind,
                    State = item.State,
                    Width = item.Width,
                    Height = item.Height,
                    CapturedAt = item.CapturedAt,
                })
                .FirstOrDefault()
        );

    public static async Task<IReadOnlyDictionary<int, GalleryMediaRef>> AlbumCoversOfAsync(
        this AppDbContext dbContext,
        IReadOnlyCollection<int> albumIds,
        CancellationToken ct
    ) =>
        (
            await dbContext
                .Albums.AsNoTracking()
                .Where(album => albumIds.Contains(album.Id))
                .Select(CoverRow)
                .ToListAsync(ct)
        )
            .Where(row => row.Cover is not null)
            .ToDictionary(row => row.AlbumId, row => row.Cover!);

    public static IQueryable<MediaItem> InCaptureOrder(this IQueryable<MediaItem> items) =>
        items.OrderBy(item => item.CapturedAt ?? item.UploadedAt).ThenBy(item => item.Id);

    private sealed record AlbumCoverRow(int AlbumId, GalleryMediaRef? Cover);
}
