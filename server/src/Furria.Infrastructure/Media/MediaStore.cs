using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaStore
{
    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly GalleryService _gallery;
    private readonly TimeProvider _timeProvider;

    public MediaStore(
        AppDbContext dbContext,
        MediaRoot root,
        GalleryService gallery,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _root = root;
        _gallery = gallery;
        _timeProvider = timeProvider;
    }

    public async Task<int> AdoptAsync(AdoptUploadCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var item = NewItem(command, await LandingAlbumIdAsync(command.AlbumId, ct), now);

        _root.MoveInto(command.StagedFilePath, MediaPaths.OriginalOf(item.StorageKey));
        try
        {
            await RecordAsync(item, command.Owner, now, ct);
        }
        catch
        {
            _root.DeleteFilesOf(item.StorageKey);
            throw;
        }

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

    private async Task<int?> LandingAlbumIdAsync(int? albumId, CancellationToken ct) =>
        albumId is { } id && await _gallery.IsLiveAlbumAsync(id, ct) ? id : null;

    private async Task RecordAsync(
        MediaItem item,
        MediaOwner owner,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.MediaItems.RemoveRange(await PicturesOfAsync(owner, ct));
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
        await LinkPictureAsync(owner, item.Id, ct);
        await transaction.CommitAsync(ct);
    }

    private async Task<IReadOnlyList<MediaItem>> PicturesOfAsync(
        MediaOwner owner,
        CancellationToken ct
    ) =>
        owner.Kind switch
        {
            MediaOwnerKind.Person => await _dbContext
                .MediaItems.Where(item =>
                    item.OwnerKind == MediaOwnerKind.Person && item.OwnerPersonId == owner.Id
                )
                .ToListAsync(ct),
            MediaOwnerKind.Group => await _dbContext
                .MediaItems.Where(item =>
                    item.OwnerKind == MediaOwnerKind.Group && item.OwnerGroupId == owner.Id
                )
                .ToListAsync(ct),
            _ => [],
        };

    private Task LinkPictureAsync(MediaOwner owner, int mediaItemId, CancellationToken ct) =>
        owner.Kind switch
        {
            MediaOwnerKind.Person => _dbContext
                .People.Where(person => person.Id == owner.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(person => person.PortraitId, mediaItemId),
                    ct
                ),
            MediaOwnerKind.Group => _dbContext
                .Groups.Where(group => group.Id == owner.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(group => group.PictureId, mediaItemId),
                    ct
                ),
            _ => Task.CompletedTask,
        };

    [Pure]
    private static MediaItem NewItem(
        AdoptUploadCommand command,
        int? albumId,
        DateTimeOffset now
    ) =>
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
            AlbumId = albumId,
            PlacedAt = albumId is null ? null : now,
            Crop = command.Crop is { } crop ? MediaCrops.ToEntity(crop) : null,
        };

    [Pure]
    private static string DownloadNameOf(string originalFileName, MediaRendition rendition) =>
        rendition == MediaRendition.Original
            ? originalFileName
            : $"{Path.GetFileNameWithoutExtension(originalFileName)}{MediaRenditions.ExtensionOf(rendition)}";
}
