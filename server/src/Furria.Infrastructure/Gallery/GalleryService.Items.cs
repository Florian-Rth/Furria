using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Application.Results;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const string BinnedItemMessage = "Ein Bild im Papierkorb wird erst wiederhergestellt.";
    private const string NotPermittedMessage = "Dieses Bild darfst du nicht einsortieren.";
    private const string ItemNotBinnedMessage = "Dieses Bild liegt nicht im Papierkorb.";

    public async Task<IReadOnlyList<InboxSummary>> GetInboxesAsync(
        GalleryActor actor,
        CancellationToken ct
    ) =>
        [
            .. (
                await InboxItems()
                    .AsNoTracking()
                    .Where(item => actor.MayManage || item.UploadedByPersonId == actor.PersonId)
                    .Where(item => actor.MayManage || item.UploadedByPersonId != null)
                    .GroupBy(item => new
                    {
                        item.UploadedByPersonId,
                        FirstName = item.UploadedBy == null ? null : item.UploadedBy.FirstName,
                        LastName = item.UploadedBy == null ? null : item.UploadedBy.LastName,
                    })
                    .Select(group => new
                    {
                        group.Key.UploadedByPersonId,
                        group.Key.FirstName,
                        group.Key.LastName,
                        Photos = group.Count(item => item.Kind == MediaKind.Photo),
                        Videos = group.Count(item => item.Kind == MediaKind.Video),
                        LatestUploadedAt = group.Max(item => item.UploadedAt),
                    })
                    .ToListAsync(ct)
            )
                .OrderByDescending(row => row.LatestUploadedAt)
                .Select(row => new InboxSummary
                {
                    Uploader = row.UploadedByPersonId is { } personId
                        ? new GalleryUploader(personId, row.FirstName!, row.LastName!)
                        : null,
                    Photos = row.Photos,
                    Videos = row.Videos,
                    LatestUploadedAt = row.LatestUploadedAt,
                }),
        ];

    public async Task<IReadOnlyList<GalleryItemSummary>> GetInboxItemsAsync(
        int? uploaderPersonId,
        CancellationToken ct
    ) =>
        await InboxItems()
            .AsNoTracking()
            .Where(item => item.UploadedByPersonId == uploaderPersonId)
            .InCaptureOrder()
            .Select(ItemSummary)
            .ToListAsync(ct);

    public async Task<Result> PlaceItemsAsync(
        PlaceGalleryItemsCommand command,
        CancellationToken ct
    )
    {
        if (!await IsLiveAlbumAsync(command.AlbumId, ct))
            return Result.NotFound(UnknownAlbumMessage);

        var items = await TrackedItemsAsync(command.MediaItemIds, ct);
        var refusal = RefusalOf(command.MediaItemIds, items, command.Actor);
        if (!refusal.IsSuccess)
            return refusal;

        var now = _timeProvider.GetUtcNow();
        var leftAlbumIds = new HashSet<int>();
        foreach (var item in items.Where(item => item.AlbumId != command.AlbumId))
        {
            if (item.AlbumId is { } leftAlbumId)
                leftAlbumIds.Add(leftAlbumId);

            item.AlbumId = command.AlbumId;
            item.PlacedAt = now;
            Unselect(item);
        }

        await SaveWithdrawingEmptiedAsync(leftAlbumIds, ct);
        return Result.Success();
    }

    public async Task<Result> DeleteItemsAsync(
        DeleteGalleryItemsCommand command,
        CancellationToken ct
    )
    {
        var items = await TrackedItemsAsync(command.MediaItemIds, ct);
        var refusal = RefusalOf(command.MediaItemIds, items, command.Actor);
        if (!refusal.IsSuccess)
            return refusal;

        var now = _timeProvider.GetUtcNow();
        var rejects = items.Where(item => item.AlbumId is null).ToList();
        var binned = items.Where(item => item.AlbumId is not null).ToList();
        foreach (var item in binned)
        {
            item.BinnedAt = now;
            Unselect(item);
        }

        _dbContext.MediaItems.RemoveRange(rejects);
        await SaveWithdrawingEmptiedAsync(
            [.. binned.Select(item => item.AlbumId!.Value).Distinct()],
            ct
        );
        _mediaFiles.Discard(rejects.Select(item => item.StorageKey));

        return Result.Success();
    }

    public async Task<Result> RestoreItemsAsync(
        IReadOnlyCollection<int> mediaItemIds,
        CancellationToken ct
    )
    {
        var items = await TrackedItemsAsync(mediaItemIds, ct);
        if (items.Count != mediaItemIds.Distinct().Count())
            return Result.NotFound(UnknownItemMessage);

        if (items.Any(item => item.BinnedAt is null))
            return Result.Conflict(ItemNotBinnedMessage);

        foreach (var item in items)
            item.BinnedAt = null;

        await _dbContext.SaveChangesAsync(ct);
        return Result.Success();
    }

    private async Task<List<MediaItem>> TrackedItemsAsync(
        IReadOnlyCollection<int> mediaItemIds,
        CancellationToken ct
    ) => await GalleryItems().Where(item => mediaItemIds.Contains(item.Id)).ToListAsync(ct);

    private async Task SaveWithdrawingEmptiedAsync(
        IReadOnlyCollection<int> albumIds,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.SaveChangesAsync(ct);
        await WithdrawEmptiedPublicationsAsync(albumIds, ct);
        await transaction.CommitAsync(ct);
    }

    private Task WithdrawEmptiedPublicationsAsync(
        IReadOnlyCollection<int> albumIds,
        CancellationToken ct
    ) =>
        _dbContext
            .Albums.Where(album =>
                albumIds.Contains(album.Id)
                && album.PublishedAt != null
                && !album.Items.Any(item => item.SelectionPosition != null)
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(album => album.PublishedAt, (DateTimeOffset?)null),
                ct
            );

    [Pure]
    private static Result RefusalOf(
        IReadOnlyCollection<int> mediaItemIds,
        IReadOnlyCollection<MediaItem> items,
        GalleryActor actor
    ) =>
        items.Count != mediaItemIds.Distinct().Count() ? Result.NotFound(UnknownItemMessage)
        : items.Any(item => item.BinnedAt is not null) ? Result.Conflict(BinnedItemMessage)
        : items.All(item => MaySort(actor, item)) ? Result.Success()
        : Result.Forbidden(NotPermittedMessage);

    [Pure]
    private static bool MaySort(GalleryActor actor, MediaItem item) =>
        actor.MayManage
        || (
            item.AlbumId is null
            && actor is { MayUpload: true, PersonId: { } personId }
            && item.UploadedByPersonId == personId
        );

    private static void Unselect(MediaItem item)
    {
        item.SelectionPosition = null;
        item.Caption = null;
    }
}
