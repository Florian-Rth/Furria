using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class PictureService
{
    private const string NoPicture = "There is no picture.";

    private readonly AppDbContext _dbContext;
    private readonly MediaRoot _root;
    private readonly MediaPictures _pictures;
    private readonly MediaJobQueue _jobQueue;

    public PictureService(
        AppDbContext dbContext,
        MediaRoot root,
        MediaPictures pictures,
        MediaJobQueue jobQueue
    )
    {
        _dbContext = dbContext;
        _root = root;
        _pictures = pictures;
        _jobQueue = jobQueue;
    }

    public async Task<PictureEditingDetails?> EditingOfAsync(MediaOwner owner, CancellationToken ct)
    {
        var picture = await PictureOf(owner)
            .AsNoTracking()
            .Select(item => new EditingRow(item.Id, item.State, item.RenderedAt, item.Crop))
            .SingleOrDefaultAsync(ct);

        return picture is null ? null : EditingOf(owner, picture);
    }

    public async Task<Result> CropAsync(MediaOwner owner, PictureCrop crop, CancellationToken ct)
    {
        var picture = await PictureOf(owner).SingleOrDefaultAsync(ct);
        if (picture is null)
            return Result.NotFound(NoPicture);

        picture.Crop = MediaCrops.ToEntity(crop);
        await _dbContext.SaveChangesAsync(ct);
        await _jobQueue.RegenerateAsync(
            new RegenerateMediaCommand
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = [picture.Id],
            },
            ct
        );

        return Result.Success();
    }

    public async Task<Result> RemoveAsync(MediaOwner owner, CancellationToken ct)
    {
        var picture = await PictureOf(owner).SingleOrDefaultAsync(ct);
        if (picture is null)
            return Result.NotFound(NoPicture);

        _dbContext.MediaItems.Remove(picture);
        await _dbContext.SaveChangesAsync(ct);
        _root.DeleteFilesOf(picture.StorageKey);

        return Result.Success();
    }

    private IQueryable<MediaItem> PictureOf(MediaOwner owner) =>
        owner.Kind switch
        {
            MediaOwnerKind.Person => _dbContext
                .People.Where(person => person.Id == owner.Id && person.Portrait != null)
                .Select(person => person.Portrait!),
            MediaOwnerKind.Group => _dbContext
                .Groups.Where(group => group.Id == owner.Id && group.Picture != null)
                .Select(group => group.Picture!),
            _ => _dbContext.MediaItems.Where(_ => false),
        };

    private PictureEditingDetails EditingOf(MediaOwner owner, EditingRow picture) =>
        new()
        {
            State = picture.State,
            Picture = _pictures.Of(owner, picture.MediaItemId, picture.RenderedAt),
            UncroppedUrl = _pictures.UncroppedUrlOf(owner, picture.MediaItemId, picture.RenderedAt),
            Crop = picture.Crop is { } crop ? MediaCrops.ToDetails(crop) : null,
        };

    private sealed record EditingRow(
        int MediaItemId,
        MediaItemState State,
        DateTimeOffset? RenderedAt,
        MediaCrop? Crop
    );
}
