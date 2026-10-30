using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Application.Website;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.News;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Website;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaStore
{
    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly GalleryService _gallery;
    private readonly NewsPictures _newsPictures;
    private readonly WebsitePictureService _websitePictures;
    private readonly MediaJobQueue _jobQueue;
    private readonly TimeProvider _timeProvider;

    public MediaStore(
        AppDbContext dbContext,
        MediaRoot root,
        GalleryService gallery,
        NewsPictures newsPictures,
        WebsitePictureService websitePictures,
        MediaJobQueue jobQueue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _root = root;
        _gallery = gallery;
        _newsPictures = newsPictures;
        _websitePictures = websitePictures;
        _jobQueue = jobQueue;
        _timeProvider = timeProvider;
    }

    public async Task<int> AdoptAsync(AdoptUploadCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var item = NewItem(command, await LandingAlbumIdAsync(command.AlbumId, ct), now);

        _root.MoveInto(command.StagedFilePath, MediaPaths.OriginalOf(item.StorageKey));
        try
        {
            await RecordAsync(item, command, now, ct);
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
            .Where(row => row.Id == mediaItemId)
            .Select(row => new ServedItemRow(
                row.Id,
                row.State,
                row.StorageKey,
                MediaOwner.Of(
                    row.OwnerKind,
                    row.OwnerPersonId,
                    row.OwnerGroupId,
                    row.OwnerNewsPostId,
                    row.OwnerEventId,
                    row.OwnerActId,
                    row.WebsitePicture == null
                        ? null
                        : new PictureSlotPosition(
                            row.WebsitePicture.SlotKey,
                            row.WebsitePicture.Position
                        )
                ),
                row.Kind,
                row.ContentType,
                row.OriginalFileName
            ))
            .SingleOrDefaultAsync(ct);
        if (item is null || !MediaRenditions.Exists(item.Kind, rendition))
            return null;

        var served = ServedFileOf(item, rendition);
        if (served is null)
            await RepairLostRenditionsAsync(item, ct);

        return served;
    }

    private MediaFileDetails? ServedFileOf(ServedItemRow item, MediaRendition rendition)
    {
        var file = RenditionFileOf(item, rendition);
        if (file.Exists)
            return FileDetailsOf(item, rendition, file);

        if (MediaRenditions.StandInFor(rendition) is not { } standIn)
            return null;

        var standInFile = RenditionFileOf(item, standIn);
        return standInFile.Exists
            ? FileDetailsOf(item, standIn, standInFile) with
            {
                IsStandIn = true,
            }
            : null;
    }

    private FileInfo RenditionFileOf(ServedItemRow item, MediaRendition rendition) =>
        new(_root.FullPathOf(MediaPaths.RenditionOf(item.StorageKey, rendition)));

    private static MediaFileDetails FileDetailsOf(
        ServedItemRow item,
        MediaRendition rendition,
        FileInfo file
    ) =>
        new()
        {
            Owner = item.Owner,
            FullPath = file.FullName,
            ContentType = MediaRenditions.ContentTypeOf(rendition, item.ContentType),
            DownloadName = DownloadNameOf(item.OriginalFileName, rendition),
            LastModified = file.LastWriteTimeUtc,
        };

    private async Task RepairLostRenditionsAsync(ServedItemRow item, CancellationToken ct)
    {
        if (item.State != MediaItemState.Ready)
            return;

        await _jobQueue.RegenerateAsync(
            new RegenerateMediaCommand
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = [item.Id],
            },
            ct
        );
    }

    private async Task<int?> LandingAlbumIdAsync(int? albumId, CancellationToken ct) =>
        albumId is { } id && await _gallery.IsLiveAlbumAsync(id, ct) ? id : null;

    private async Task RecordAsync(
        MediaItem item,
        AdoptUploadCommand command,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        _dbContext.MediaItems.RemoveRange(await PicturesOfAsync(command.Owner, ct));
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
        await LinkPictureAsync(command, item.Id, ct);
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
            MediaOwnerKind.Event => await _dbContext
                .MediaItems.Where(item =>
                    item.OwnerKind == MediaOwnerKind.Event && item.OwnerEventId == owner.Id
                )
                .ToListAsync(ct),
            _ => [],
        };

    private Task LinkPictureAsync(
        AdoptUploadCommand command,
        int mediaItemId,
        CancellationToken ct
    ) =>
        command.Owner.Kind switch
        {
            MediaOwnerKind.Person => _dbContext
                .People.Where(person => person.Id == command.Owner.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(person => person.PortraitId, mediaItemId),
                    ct
                ),
            MediaOwnerKind.Group => _dbContext
                .Groups.Where(group => group.Id == command.Owner.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(group => group.PictureId, mediaItemId),
                    ct
                ),
            MediaOwnerKind.Event => _dbContext
                .Events.Where(row => row.CalendarEntryId == command.Owner.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(row => row.PictureId, mediaItemId),
                    ct
                ),
            MediaOwnerKind.NewsPost => _newsPictures.PlaceAsync(
                new PlaceNewsPictureCommand
                {
                    NewsPostId = command.Owner.Id!.Value,
                    MediaItemId = mediaItemId,
                    PlacedByPersonId = command.UploadedByPersonId,
                },
                ct
            ),
            MediaOwnerKind.Website => _websitePictures.PlaceAsync(
                new PlaceWebsitePictureCommand
                {
                    Slot = command.Owner.Slot!.Value,
                    MediaItemId = mediaItemId,
                    Aspect = command.Aspect!.Value,
                    PlacedByPersonId = command.UploadedByPersonId,
                },
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
            OwnerNewsPostId =
                command.Owner.Kind == MediaOwnerKind.NewsPost ? command.Owner.Id : null,
            OwnerEventId = command.Owner.Kind == MediaOwnerKind.Event ? command.Owner.Id : null,
            OwnerActId = command.Owner.Kind == MediaOwnerKind.Act ? command.Owner.Id : null,
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

    private sealed record ServedItemRow(
        int Id,
        MediaItemState State,
        Guid StorageKey,
        MediaOwner Owner,
        MediaKind Kind,
        string ContentType,
        string OriginalFileName
    );
}
