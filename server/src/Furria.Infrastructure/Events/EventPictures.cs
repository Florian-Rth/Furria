using Furria.Application.Events;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Events;

public sealed class EventPictures
{
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string UnknownGalleryPhotoMessage =
        "Dieses Foto liegt in keinem Album der Galerie.";

    private readonly AppDbContext _dbContext;
    private readonly MediaCopier _copier;

    public EventPictures(AppDbContext dbContext, MediaCopier copier)
    {
        _dbContext = dbContext;
        _copier = copier;
    }

    public async Task<Result<int>> PickFromGalleryAsync(
        PickEventPictureCommand command,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Events.AnyAsync(row => row.CalendarEntryId == command.EventId, ct))
            return Result<int>.NotFound(UnknownEventMessage);

        var photo = await _dbContext
            .MediaItems.AsNoTracking()
            .Where(GalleryPicks.IsPickablePhoto)
            .SingleOrDefaultAsync(item => item.Id == command.GalleryItemId, ct);
        if (photo is null)
            return Result<int>.NotFound(UnknownGalleryPhotoMessage);

        return await _copier.CopyPhotoAsync(
            photo,
            MediaOwner.Event(command.EventId),
            command.Crop,
            copyId => PlaceAsync(command.EventId, copyId, ct),
            ct
        );
    }

    private async Task PlaceAsync(int eventId, int pictureId, CancellationToken ct)
    {
        await _dbContext
            .Events.Where(row => row.CalendarEntryId == eventId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.PictureId, pictureId),
                ct
            );
        await _dbContext
            .MediaItems.Where(item => item.OwnerEventId == eventId && item.Id != pictureId)
            .ExecuteDeleteAsync(ct);
    }
}
