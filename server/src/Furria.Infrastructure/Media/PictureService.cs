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
    private readonly MediaPictures _pictures;
    private readonly MediaJobQueue _jobQueue;
    private readonly TimeProvider _timeProvider;

    public PictureService(
        AppDbContext dbContext,
        MediaPictures pictures,
        MediaJobQueue jobQueue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _pictures = pictures;
        _jobQueue = jobQueue;
        _timeProvider = timeProvider;
    }

    public async Task<PictureEditingDetails?> EditingOfAsync(MediaOwner owner, CancellationToken ct)
    {
        var picture = await PictureOf(owner)
            .AsNoTracking()
            .Select(item => new MediaPictureRow(item.Id, item.State, item.RenderedAt, item.Crop))
            .SingleOrDefaultAsync(ct);

        if (picture is null)
            return null;

        var stalledIds = await _dbContext.StalledAmongAsync(
            [picture],
            _timeProvider.GetUtcNow(),
            ct
        );
        return _pictures.EditingOf(owner, picture, stalledIds);
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
            MediaOwnerKind.Event => _dbContext
                .Events.Where(row => row.CalendarEntryId == owner.Id && row.Picture != null)
                .Select(row => row.Picture!),
            _ => _dbContext.MediaItems.Where(_ => false),
        };
}
