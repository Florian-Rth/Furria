using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed class NewsPictures
{
    private const string UnknownPostMessage = "Diese Meldung gibt es nicht.";
    private const string NoPictureMessage = "Diese Meldung hat kein Bild.";
    private const string UnknownGalleryPhotoMessage =
        "Dieses Foto liegt in keinem Album der Galerie.";

    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly MediaJobQueue _jobQueue;
    private readonly TimeProvider _timeProvider;

    public NewsPictures(
        AppDbContext dbContext,
        MediaRoot root,
        MediaJobQueue jobQueue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _root = root;
        _jobQueue = jobQueue;
        _timeProvider = timeProvider;
    }

    public async Task<Result> CropAsync(CropNewsPictureCommand command, CancellationToken ct)
    {
        var post = await _dbContext.NewsPosts.SingleOrDefaultAsync(
            row => row.Id == command.NewsPostId,
            ct
        );
        if (post is null)
            return Result.NotFound(UnknownPostMessage);

        if (NewsWorkingCopy.WorkingPictureIdOf(post) is not { } pictureId)
            return Result.NotFound(NoPictureMessage);

        var picture = await _dbContext.MediaItems.SingleAsync(item => item.Id == pictureId, ct);
        var placement = new Placement(post, command.CroppedByPersonId);
        if (NewsWorkingCopy.IsLive(post) && post.PictureId == pictureId)
            await PlaceCopyAsync(placement, picture, command.Crop, ct);
        else
            await RecropAsync(placement, picture, command.Crop, ct);

        return Result.Success();
    }

    public async Task<Result<int>> PickFromGalleryAsync(
        PickNewsPictureCommand command,
        CancellationToken ct
    )
    {
        var post = await _dbContext.NewsPosts.SingleOrDefaultAsync(
            row => row.Id == command.NewsPostId,
            ct
        );
        if (post is null)
            return Result<int>.NotFound(UnknownPostMessage);

        var photo = await _dbContext
            .MediaItems.AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.Id == command.GalleryItemId
                    && item.OwnerKind == MediaOwnerKind.Gallery
                    && item.Kind == MediaKind.Photo
                    && item.State == MediaItemState.Ready
                    && item.AlbumId != null
                    && item.BinnedAt == null
                    && item.Album!.BinnedAt == null,
                ct
            );
        if (photo is null)
            return Result<int>.NotFound(UnknownGalleryPhotoMessage);

        return Result<int>.Success(
            await PlaceCopyAsync(
                new Placement(post, command.PickedByPersonId),
                photo,
                command.Crop,
                ct
            )
        );
    }

    public async Task<Result> RemoveAsync(
        int newsPostId,
        int? removedByPersonId,
        CancellationToken ct
    )
    {
        var post = await _dbContext.NewsPosts.SingleOrDefaultAsync(row => row.Id == newsPostId, ct);
        if (post is null)
            return Result.NotFound(UnknownPostMessage);

        if (NewsWorkingCopy.WorkingPictureIdOf(post) is null)
            return Result.Success();

        var dropped = await PlaceAsync(new Placement(post, removedByPersonId), null, ct);
        await _dbContext.SaveChangesAsync(ct);
        DeleteFilesOf(dropped);
        return Result.Success();
    }

    internal async Task<IReadOnlyList<Guid>> PlaceAsync(
        PlaceNewsPictureCommand command,
        CancellationToken ct
    )
    {
        var post = await _dbContext.NewsPosts.SingleAsync(row => row.Id == command.NewsPostId, ct);
        var dropped = await PlaceAsync(
            new Placement(post, command.PlacedByPersonId),
            command.MediaItemId,
            ct
        );
        await _dbContext.SaveChangesAsync(ct);
        return dropped;
    }

    internal async Task<IReadOnlyList<Guid>> DropUnusedAsync(NewsPost post, CancellationToken ct)
    {
        var unused = await _dbContext
            .MediaItems.Where(item =>
                item.OwnerNewsPostId == post.Id
                && item.Id != post.PictureId
                && item.Id != post.PendingPictureId
            )
            .ToListAsync(ct);
        _dbContext.MediaItems.RemoveRange(unused);
        return [.. unused.Select(item => item.StorageKey)];
    }

    internal async Task<IReadOnlyList<Guid>> AllOfAsync(int newsPostId, CancellationToken ct) =>
        await _dbContext
            .MediaItems.Where(item => item.OwnerNewsPostId == newsPostId)
            .Select(item => item.StorageKey)
            .ToListAsync(ct);

    internal void DeleteFilesOf(IEnumerable<Guid> storageKeys)
    {
        foreach (var storageKey in storageKeys)
            _root.DeleteFilesOf(storageKey);
    }

    private async Task<IReadOnlyList<Guid>> PlaceAsync(
        Placement placement,
        int? mediaItemId,
        CancellationToken ct
    )
    {
        NewsWorkingCopy.PlacePicture(placement.Post, mediaItemId, _timeProvider.GetUtcNow());
        NewsWorkingCopy.MarkSaved(placement.Post, placement.ByPersonId);
        return await DropUnusedAsync(placement.Post, ct);
    }

    private async Task RecropAsync(
        Placement placement,
        MediaItem picture,
        PictureCrop crop,
        CancellationToken ct
    )
    {
        picture.Crop = MediaCrops.ToEntity(crop);
        await PlaceAsync(placement, picture.Id, ct);
        await _dbContext.SaveChangesAsync(ct);
        await _jobQueue.RegenerateAsync(
            new RegenerateMediaCommand
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = [picture.Id],
            },
            ct
        );
    }

    private async Task<int> PlaceCopyAsync(
        Placement placement,
        MediaItem source,
        PictureCrop crop,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var copy = CopyOf(source, placement.Post.Id, crop, now);
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
        var dropped = await PlaceAsync(placement, copy.Id, ct);
        await _dbContext.SaveChangesAsync(ct);
        _root.CopyInto(
            MediaPaths.OriginalOf(source.StorageKey),
            MediaPaths.OriginalOf(copy.StorageKey)
        );
        await transaction.CommitAsync(ct);

        DeleteFilesOf(dropped);
        return copy.Id;
    }

    [Pure]
    private static MediaItem CopyOf(
        MediaItem source,
        int newsPostId,
        PictureCrop crop,
        DateTimeOffset now
    ) =>
        new()
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = MediaOwnerKind.NewsPost,
            OwnerNewsPostId = newsPostId,
            Kind = MediaKind.Photo,
            State = MediaItemState.Processing,
            OriginalFileName = source.OriginalFileName,
            ContentType = source.ContentType,
            ByteSize = source.ByteSize,
            UploadedByPersonId = source.UploadedByPersonId,
            UploadedAt = now,
            Crop = MediaCrops.ToEntity(crop),
        };

    private sealed record Placement(NewsPost Post, int? ByPersonId);
}
