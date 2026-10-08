using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaStore
{
    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly TimeProvider _timeProvider;

    public MediaStore(AppDbContext dbContext, MediaRoot root, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _root = root;
        _timeProvider = timeProvider;
    }

    public async Task<int> AdoptAsync(AdoptUploadCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var item = NewItem(command, now);
        _dbContext.MediaItems.Add(item);
        _dbContext.MediaJobs.Add(
            new MediaJob
            {
                MediaItem = item,
                EnqueuedAt = now,
                AvailableAt = now,
            }
        );

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.SaveChangesAsync(ct);
        _root.MoveInto(command.StagedFilePath, MediaPaths.OriginalOf(item.StorageKey));
        await transaction.CommitAsync(ct);

        return item.Id;
    }

    public async Task<MediaFileDetails?> FileOfAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    )
    {
        var item = await _dbContext
            .MediaItems.AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == mediaItemId, ct);
        if (item is null || !MediaRenditions.Exists(item.Kind, rendition))
            return null;

        var file = new FileInfo(
            _root.FullPathOf(MediaPaths.RenditionOf(item.StorageKey, rendition))
        );
        if (!file.Exists)
            return null;

        return new MediaFileDetails
        {
            Owner = MediaOwner.Of(item),
            FullPath = file.FullName,
            ContentType = MediaRenditions.ContentTypeOf(rendition, item.ContentType),
            DownloadName = DownloadNameOf(item.OriginalFileName, rendition),
            LastModified = file.LastWriteTimeUtc,
        };
    }

    [Pure]
    private static MediaItem NewItem(AdoptUploadCommand command, DateTimeOffset now) =>
        new()
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = command.Owner.Kind,
            OwnerPersonId = command.Owner.Kind == MediaOwnerKind.Person ? command.Owner.Id : null,
            OwnerGroupId = command.Owner.Kind == MediaOwnerKind.Group ? command.Owner.Id : null,
            Kind = command.Format.Kind,
            State = MediaItemState.Processing,
            OriginalFileName = command.OriginalFileName,
            ContentType = command.Format.ContentType,
            ByteSize = command.ByteSize,
            UploadedByPersonId = command.UploadedByPersonId,
            UploadedAt = now,
        };

    [Pure]
    private static string DownloadNameOf(string originalFileName, MediaRendition rendition) =>
        rendition == MediaRendition.Original
            ? originalFileName
            : $"{Path.GetFileNameWithoutExtension(originalFileName)}{MediaRenditions.ExtensionOf(rendition)}";
}
