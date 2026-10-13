using System.Linq.Expressions;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Application.Website;
using Furria.Core.Media;
using Furria.Core.Website;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Website;

public sealed class WebsitePictureService
{
    private const string EmptyPositionMessage = "Dieser Bildplatz ist leer.";
    private const string FilledPositionMessage = "Dieser Bildplatz ist schon belegt.";
    private const string SamePositionMessage =
        "Ein Bild wird auf einen anderen Bildplatz übertragen.";
    private const string UnknownGalleryPhotoMessage =
        "Dieses Foto liegt in keinem Album der Galerie.";

    private readonly AppDbContext _dbContext;
    private readonly MediaCopier _copier;
    private readonly MediaPictures _pictures;
    private readonly MediaJobQueue _jobQueue;
    private readonly TimeProvider _timeProvider;

    public WebsitePictureService(
        AppDbContext dbContext,
        MediaCopier copier,
        MediaPictures pictures,
        MediaJobQueue jobQueue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _copier = copier;
        _pictures = pictures;
        _jobQueue = jobQueue;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<WebsitePictureDetails>> ListAsync(CancellationToken ct)
    {
        var rows = await _dbContext
            .WebsitePictures.AsNoTracking()
            .OrderBy(picture => picture.SlotKey)
            .ThenBy(picture => picture.Position)
            .Select(picture => new WebsitePictureRow(
                picture.SlotKey,
                picture.Position,
                picture.Aspect,
                picture.Alt,
                picture.UpdatedAt,
                picture.UpdatedBy == null
                    ? null
                    : new WebsitePictureEditor(
                        picture.UpdatedBy.Id,
                        picture.UpdatedBy.FirstName,
                        picture.UpdatedBy.LastName
                    ),
                new MediaPictureRow(
                    picture.MediaItemId,
                    picture.MediaItem!.State,
                    picture.MediaItem.RenderedAt,
                    picture.MediaItem.Crop
                )
            ))
            .ToListAsync(ct);

        return [.. rows.Select(DetailsOf)];
    }

    public async Task<Result> CropAsync(CropWebsitePictureCommand command, CancellationToken ct)
    {
        var picture = await _dbContext
            .WebsitePictures.Include(row => row.MediaItem)
            .SingleOrDefaultAsync(At(command.Slot), ct);
        if (picture is null)
            return Result.NotFound(EmptyPositionMessage);

        picture.MediaItem!.Crop = MediaCrops.ToEntity(command.Crop);
        picture.Aspect = command.Aspect;
        MarkUpdated(picture, command.CroppedByPersonId);
        await _dbContext.SaveChangesAsync(ct);
        await _jobQueue.RegenerateAsync(
            new RegenerateMediaCommand
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = [picture.MediaItemId],
            },
            ct
        );

        return Result.Success();
    }

    public async Task<Result> DescribeAsync(
        DescribeWebsitePictureCommand command,
        CancellationToken ct
    )
    {
        var picture = await _dbContext.WebsitePictures.SingleOrDefaultAsync(At(command.Slot), ct);
        if (picture is null)
            return Result.NotFound(EmptyPositionMessage);

        picture.Alt = string.IsNullOrWhiteSpace(command.Alt) ? null : command.Alt.Trim();
        MarkUpdated(picture, command.DescribedByPersonId);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> ClearAsync(PictureSlotPosition slot, CancellationToken ct)
    {
        var cleared = await OccupantOf(slot).ExecuteDeleteAsync(ct);

        return cleared == 0 ? Result.NotFound(EmptyPositionMessage) : Result.Success();
    }

    public async Task<Result<int>> PickFromGalleryAsync(
        PickWebsitePictureCommand command,
        CancellationToken ct
    )
    {
        var photo = await _dbContext
            .MediaItems.AsNoTracking()
            .Where(GalleryPicks.IsPickablePhoto)
            .SingleOrDefaultAsync(item => item.Id == command.GalleryItemId, ct);
        if (photo is null)
            return Result<int>.NotFound(UnknownGalleryPhotoMessage);

        return await PlaceCopyAsync(
            photo,
            new Placement(command.Slot, command.Aspect, null, command.PickedByPersonId),
            command.Crop,
            ct
        );
    }

    public async Task<Result<int>> CopyFromSlotAsync(
        CopyWebsitePictureCommand command,
        CancellationToken ct
    )
    {
        var source = await _dbContext
            .WebsitePictures.AsNoTracking()
            .Where(At(command.SourceSlot))
            .Select(picture => new { picture.MediaItem, picture.Alt })
            .SingleOrDefaultAsync(ct);
        if (source?.MediaItem is not { State: MediaItemState.Ready } photo)
            return Result<int>.NotFound(EmptyPositionMessage);

        return await PlaceCopyAsync(
            photo,
            new Placement(command.Slot, command.Aspect, source.Alt, command.CopiedByPersonId),
            command.Crop,
            ct
        );
    }

    public async Task<Result> TransferAsync(
        TransferWebsitePictureCommand command,
        CancellationToken ct
    )
    {
        if (command.From == command.To)
            return Result.Validation(SamePositionMessage);

        var picture = await _dbContext
            .WebsitePictures.AsNoTracking()
            .SingleOrDefaultAsync(At(command.From), ct);
        if (picture is null)
            return Result.NotFound(EmptyPositionMessage);

        if (await _dbContext.WebsitePictures.AnyAsync(At(command.To), ct))
            return Result.Conflict(FilledPositionMessage);

        var now = _timeProvider.GetUtcNow();
        await _dbContext
            .WebsitePictures.Where(At(command.From))
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(row => row.SlotKey, command.To.SlotKey)
                        .SetProperty(row => row.Position, command.To.Position)
                        .SetProperty(row => row.UpdatedAt, now)
                        .SetProperty(row => row.UpdatedByPersonId, command.TransferredByPersonId),
                ct
            );

        return Result.Success();
    }

    internal async Task PlaceAsync(PlaceWebsitePictureCommand command, CancellationToken ct)
    {
        await OccupantOf(command.Slot).ExecuteDeleteAsync(ct);
        _dbContext.WebsitePictures.Add(
            new WebsitePicture
            {
                SlotKey = command.Slot.SlotKey,
                Position = command.Slot.Position,
                MediaItemId = command.MediaItemId,
                Aspect = command.Aspect,
                Alt = command.Alt,
                UpdatedAt = _timeProvider.GetUtcNow(),
                UpdatedByPersonId = command.PlacedByPersonId,
            }
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    private Task<Result<int>> PlaceCopyAsync(
        MediaItem source,
        Placement placement,
        PictureCrop crop,
        CancellationToken ct
    ) =>
        _copier.CopyPhotoAsync(
            source,
            MediaOwner.Website(placement.Slot),
            crop,
            copyId =>
                PlaceAsync(
                    new PlaceWebsitePictureCommand
                    {
                        Slot = placement.Slot,
                        MediaItemId = copyId,
                        Aspect = placement.Aspect,
                        Alt = placement.Alt,
                        PlacedByPersonId = placement.ByPersonId,
                    },
                    ct
                ),
            ct
        );

    private IQueryable<MediaItem> OccupantOf(PictureSlotPosition slot) =>
        _dbContext.MediaItems.Where(item =>
            item.WebsitePicture!.SlotKey == slot.SlotKey
            && item.WebsitePicture.Position == slot.Position
        );

    private void MarkUpdated(WebsitePicture picture, int? byPersonId)
    {
        picture.UpdatedAt = _timeProvider.GetUtcNow();
        picture.UpdatedByPersonId = byPersonId;
    }

    private WebsitePictureDetails DetailsOf(WebsitePictureRow row)
    {
        var slot = new PictureSlotPosition(row.SlotKey, row.Position);
        return new WebsitePictureDetails
        {
            Slot = slot,
            MediaItemId = row.Picture.MediaItemId,
            Aspect = row.Aspect,
            Alt = row.Alt,
            Picture = _pictures.EditingOf(MediaOwner.Website(slot), row.Picture),
            UpdatedAt = row.UpdatedAt,
            UpdatedBy = row.UpdatedBy,
        };
    }

    private static Expression<Func<WebsitePicture, bool>> At(PictureSlotPosition slot) =>
        picture => picture.SlotKey == slot.SlotKey && picture.Position == slot.Position;

    private sealed record Placement(
        PictureSlotPosition Slot,
        double Aspect,
        string? Alt,
        int? ByPersonId
    );

    private sealed record WebsitePictureRow(
        string SlotKey,
        int Position,
        double Aspect,
        string? Alt,
        DateTimeOffset UpdatedAt,
        WebsitePictureEditor? UpdatedBy,
        MediaPictureRow Picture
    );
}
