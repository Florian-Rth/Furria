using System.Diagnostics.Contracts;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Media;

public sealed class MediaCopier
{
    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly TimeProvider _timeProvider;

    public MediaCopier(AppDbContext dbContext, MediaRoot root, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _root = root;
        _timeProvider = timeProvider;
    }

    public async Task<int> CopyPhotoAsync(
        MediaItem source,
        MediaOwner owner,
        PictureCrop crop,
        Func<int, Task> placeCopyAsync,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var copy = CopyOf(source, owner, crop, now);

        _root.CopyInto(
            MediaPaths.OriginalOf(source.StorageKey),
            MediaPaths.OriginalOf(copy.StorageKey)
        );
        try
        {
            await RecordAsync(copy, now, placeCopyAsync, ct);
        }
        catch
        {
            _root.DeleteFilesOf(copy.StorageKey);
            throw;
        }

        return copy.Id;
    }

    private async Task RecordAsync(
        MediaItem copy,
        DateTimeOffset now,
        Func<int, Task> placeCopyAsync,
        CancellationToken ct
    )
    {
        _dbContext.MediaItems.Add(copy);
        _dbContext.MediaJobs.Add(
            new MediaJob
            {
                MediaItem = copy,
                EnqueuedAt = now,
                AvailableAt = now,
            }
        );

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.SaveChangesAsync(ct);
        await placeCopyAsync(copy.Id);
        await transaction.CommitAsync(ct);
    }

    [Pure]
    private static MediaItem CopyOf(
        MediaItem source,
        MediaOwner owner,
        PictureCrop crop,
        DateTimeOffset now
    ) =>
        new()
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = owner.Kind,
            OwnerNewsPostId = owner.Kind == MediaOwnerKind.NewsPost ? owner.Id : null,
            Kind = MediaKind.Photo,
            State = MediaItemState.Processing,
            OriginalFileName = source.OriginalFileName,
            ContentType = source.ContentType,
            ByteSize = source.ByteSize,
            UploadedByPersonId = source.UploadedByPersonId,
            UploadedAt = now,
            Crop = MediaCrops.ToEntity(crop),
        };
}
