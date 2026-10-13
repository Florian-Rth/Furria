using Furria.Application.Media;
using Furria.Application.News;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Gallery;
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
    private readonly MediaCopier _copier;
    private readonly MediaJobQueue _jobQueue;
    private readonly TimeProvider _timeProvider;

    public NewsPictures(
        AppDbContext dbContext,
        MediaCopier copier,
        MediaJobQueue jobQueue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _copier = copier;
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
        if (!NewsWorkingCopy.IsLive(post) || post.PictureId != pictureId)
        {
            await RecropAsync(placement, picture, command.Crop, ct);
            return Result.Success();
        }

        var copied = await PlaceCopyAsync(placement, picture, command.Crop, ct);
        return copied.IsSuccess ? Result.Success() : Result.Carrying(copied);
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
            .Where(GalleryPicks.IsPickablePhoto)
            .SingleOrDefaultAsync(item => item.Id == command.GalleryItemId, ct);
        if (photo is null)
            return Result<int>.NotFound(UnknownGalleryPhotoMessage);

        return await PlaceCopyAsync(
            new Placement(post, command.PickedByPersonId),
            photo,
            command.Crop,
            ct
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

        await PlaceAsync(new Placement(post, removedByPersonId), null, ct);
        await _dbContext.SaveChangesAsync(ct);
        return Result.Success();
    }

    internal async Task PlaceAsync(PlaceNewsPictureCommand command, CancellationToken ct)
    {
        var post = await _dbContext.NewsPosts.SingleAsync(row => row.Id == command.NewsPostId, ct);
        await PlaceAsync(new Placement(post, command.PlacedByPersonId), command.MediaItemId, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    internal async Task DropUnusedAsync(NewsPost post, CancellationToken ct)
    {
        var unused = await _dbContext
            .MediaItems.Where(item =>
                item.OwnerNewsPostId == post.Id
                && item.Id != post.PictureId
                && item.Id != post.PendingPictureId
            )
            .ToListAsync(ct);
        _dbContext.MediaItems.RemoveRange(unused);
    }

    private async Task PlaceAsync(Placement placement, int? mediaItemId, CancellationToken ct)
    {
        NewsWorkingCopy.PlacePicture(placement.Post, mediaItemId, _timeProvider.GetUtcNow());
        NewsWorkingCopy.MarkSaved(placement.Post, placement.ByPersonId);
        await DropUnusedAsync(placement.Post, ct);
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

    private Task<Result<int>> PlaceCopyAsync(
        Placement placement,
        MediaItem source,
        PictureCrop crop,
        CancellationToken ct
    ) =>
        _copier.CopyPhotoAsync(
            source,
            MediaOwner.NewsPost(placement.Post.Id),
            crop,
            async copyId =>
            {
                await PlaceAsync(placement, copyId, ct);
                await _dbContext.SaveChangesAsync(ct);
            },
            ct
        );

    private sealed record Placement(NewsPost Post, int? ByPersonId);
}
