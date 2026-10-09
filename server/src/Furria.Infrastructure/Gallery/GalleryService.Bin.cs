using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    public async Task<GalleryBinDetails> GetBinAsync(CancellationToken ct)
    {
        var albums = await _dbContext
            .Albums.AsNoTracking()
            .Where(album => album.BinnedAt != null)
            .OrderByDescending(album => album.BinnedAt)
            .ThenByDescending(album => album.Id)
            .Select(album => new BinnedAlbumRow(
                album.Id,
                album.Title,
                album.Items.Count(),
                album.BinnedAt!.Value
            ))
            .ToListAsync(ct);
        var covers = await _dbContext.AlbumCoversOfAsync(
            [.. albums.Select(album => album.AlbumId)],
            ct
        );

        return new GalleryBinDetails
        {
            Albums =
            [
                .. albums.Select(album => new BinnedAlbumSummary
                {
                    AlbumId = album.AlbumId,
                    Title = album.Title,
                    ItemCount = album.ItemCount,
                    Cover = covers.GetValueOrDefault(album.AlbumId),
                    BinnedAt = album.BinnedAt,
                    PurgesAt = GalleryBin.PurgesAt(album.BinnedAt),
                }),
            ],
            Items = [.. (await BinnedItemsAsync(ct)).Select(ToSummary)],
        };
    }

    public async Task<int> PurgeBinAsync(CancellationToken ct)
    {
        var expiredBefore = GalleryBin.ExpiredIfBinnedBefore(_timeProvider.GetUtcNow());
        var expiredAlbums = _dbContext.Albums.Where(album => album.BinnedAt < expiredBefore);
        var expiredItems = _dbContext.MediaItems.Where(item =>
            item.BinnedAt < expiredBefore || expiredAlbums.Any(album => album.Id == item.AlbumId)
        );

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var storageKeys = await expiredItems.Select(item => item.StorageKey).ToListAsync(ct);
        await expiredItems.ExecuteDeleteAsync(ct);
        var purgedAlbums = await expiredAlbums.ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct);

        _mediaFiles.Discard(storageKeys);
        return storageKeys.Count + purgedAlbums;
    }

    private async Task<IReadOnlyList<BinnedItemRow>> BinnedItemsAsync(CancellationToken ct) =>
        await _dbContext
            .MediaItems.AsNoTracking()
            .Where(item => item.BinnedAt != null && item.Album!.BinnedAt == null)
            .OrderByDescending(item => item.BinnedAt)
            .ThenByDescending(item => item.Id)
            .Select(item => new BinnedItemRow(
                new GalleryMediaRef
                {
                    MediaItemId = item.Id,
                    Kind = item.Kind,
                    State = item.State,
                    Width = item.Width,
                    Height = item.Height,
                    CapturedAt = item.CapturedAt,
                },
                item.OriginalFileName,
                item.AlbumId!.Value,
                item.Album!.Title,
                item.BinnedAt!.Value
            ))
            .ToListAsync(ct);

    private static BinnedItemSummary ToSummary(BinnedItemRow row) =>
        new()
        {
            Item = row.Item,
            OriginalFileName = row.OriginalFileName,
            AlbumId = row.AlbumId,
            AlbumTitle = row.AlbumTitle,
            BinnedAt = row.BinnedAt,
            PurgesAt = GalleryBin.PurgesAt(row.BinnedAt),
        };

    private sealed record BinnedAlbumRow(
        int AlbumId,
        string Title,
        int ItemCount,
        DateTimeOffset BinnedAt
    );

    private sealed record BinnedItemRow(
        GalleryMediaRef Item,
        string OriginalFileName,
        int AlbumId,
        string AlbumTitle,
        DateTimeOffset BinnedAt
    );
}
