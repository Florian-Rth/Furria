using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Core.Media;
using Furria.Infrastructure.News;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaStore
{
    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly NewsPictures _newsPictures;
    private readonly TimeProvider _timeProvider;

    public MediaStore(
        AppDbContext dbContext,
        MediaRoot root,
        NewsPictures newsPictures,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _root = root;
        _newsPictures = newsPictures;
        _timeProvider = timeProvider;
    }

    public async Task<int> AdoptAsync(AdoptUploadCommand command, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var item = NewItem(command, now);
        var replaced = await PicturesOfAsync(command.Owner, ct);
        _dbContext.MediaItems.RemoveRange(replaced);
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
        var dropped = await LinkPictureAsync(command, item.Id, ct);
        _root.MoveInto(command.StagedFilePath, MediaPaths.OriginalOf(item.StorageKey));
        await transaction.CommitAsync(ct);

        foreach (var storageKey in replaced.Select(picture => picture.StorageKey).Concat(dropped))
            _root.DeleteFilesOf(storageKey);

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

    private async Task<IReadOnlyList<Guid>> LinkPictureAsync(
        AdoptUploadCommand command,
        int mediaItemId,
        CancellationToken ct
    )
    {
        var owner = command.Owner;
        switch (owner.Kind)
        {
            case MediaOwnerKind.Person:
                await _dbContext
                    .People.Where(person => person.Id == owner.Id)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(person => person.PortraitId, mediaItemId),
                        ct
                    );
                return [];
            case MediaOwnerKind.Group:
                await _dbContext
                    .Groups.Where(group => group.Id == owner.Id)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(group => group.PictureId, mediaItemId),
                        ct
                    );
                return [];
            case MediaOwnerKind.NewsPost:
                return await _newsPictures.PlaceAsync(
                    new PlaceNewsPictureCommand
                    {
                        NewsPostId = owner.Id!.Value,
                        MediaItemId = mediaItemId,
                        PlacedByPersonId = command.UploadedByPersonId,
                    },
                    ct
                );
            default:
                return [];
        }
    }

    [Pure]
    private static MediaItem NewItem(AdoptUploadCommand command, DateTimeOffset now) =>
        new()
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = command.Owner.Kind,
            OwnerPersonId = command.Owner.Kind == MediaOwnerKind.Person ? command.Owner.Id : null,
            OwnerGroupId = command.Owner.Kind == MediaOwnerKind.Group ? command.Owner.Id : null,
            OwnerNewsPostId =
                command.Owner.Kind == MediaOwnerKind.NewsPost ? command.Owner.Id : null,
            Kind = command.Format.Kind,
            State = MediaItemState.Processing,
            OriginalFileName = command.OriginalFileName,
            ContentType = command.Format.ContentType,
            ByteSize = command.ByteSize,
            UploadedByPersonId = command.UploadedByPersonId,
            UploadedAt = now,
            AlbumId = command.AlbumId,
            PlacedAt = command.AlbumId is null ? null : now,
            Crop = command.Crop is { } crop ? MediaCrops.ToEntity(crop) : null,
        };

    [Pure]
    private static string DownloadNameOf(string originalFileName, MediaRendition rendition) =>
        rendition == MediaRendition.Original
            ? originalFileName
            : $"{Path.GetFileNameWithoutExtension(originalFileName)}{MediaRenditions.ExtensionOf(rendition)}";
}
