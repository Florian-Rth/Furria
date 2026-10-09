using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Application.Results;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const string RepeatedSelectionMessage = "Ein Foto steht nur einmal in der Auswahl.";
    private const string ForeignSelectionMessage = "Die Auswahl nimmt nur Fotos aus diesem Album.";
    private const string VideoSelectionMessage = "Videos sind nie öffentlich.";
    private const string UnreadySelectionMessage =
        "Ein Foto der Auswahl ist noch nicht fertig verarbeitet.";
    private const string SessionlessMessage =
        "Nur ein Album mit Session kann veröffentlicht werden.";
    private const string EmptySelectionMessage =
        "Zum Veröffentlichen braucht die Auswahl mindestens ein Foto.";

    public async Task<Result> SetSelectionAsync(AlbumSelectionCommand command, CancellationToken ct)
    {
        var album = await LiveAlbums().SingleOrDefaultAsync(row => row.Id == command.AlbumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        var chosenIds = command.Entries.Select(entry => entry.MediaItemId).ToList();
        if (chosenIds.Distinct().Count() != chosenIds.Count)
            return Result.Validation(RepeatedSelectionMessage);

        var chosen = await LiveItemsOf(album.Id)
            .Where(item => chosenIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, ct);
        var refusal = SelectionRefusalOf(chosenIds.Count, chosen.Values);
        if (!refusal.IsSuccess)
            return refusal;

        foreach (var held in await LiveItemsOf(album.Id).Where(IsSelected).ToListAsync(ct))
            Unselect(held);

        foreach (var (entry, position) in command.Entries.Select((entry, index) => (entry, index)))
        {
            var item = chosen[entry.MediaItemId];
            item.SelectionPosition = position + 1;
            item.Caption = TextOrNull(entry.Caption);
        }

        if (command.Entries.Count == 0)
            album.PublishedAt = null;

        await _dbContext.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> PublishAsync(int albumId, CancellationToken ct)
    {
        var album = await LiveAlbums().SingleOrDefaultAsync(row => row.Id == albumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        if (album.CalendarEntryId is null && album.SessionStartYear is null)
            return Result.Conflict(SessionlessMessage);

        if (!await LiveItemsOf(albumId).AnyAsync(IsSelected, ct))
            return Result.Conflict(EmptySelectionMessage);

        album.PublishedAt ??= _timeProvider.GetUtcNow();
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> UnpublishAsync(int albumId, CancellationToken ct)
    {
        var album = await LiveAlbums().SingleOrDefaultAsync(row => row.Id == albumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        album.PublishedAt = null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static Result SelectionRefusalOf(
        int chosenCount,
        IReadOnlyCollection<MediaItem> found
    ) =>
        found.Count != chosenCount ? Result.Validation(ForeignSelectionMessage)
        : found.Any(item => item.Kind != MediaKind.Photo) ? Result.Validation(VideoSelectionMessage)
        : found.Any(item => item.State != MediaItemState.Ready)
            ? Result.Validation(UnreadySelectionMessage)
        : Result.Success();
}
