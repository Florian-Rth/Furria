using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class GallerySeedMaterializer
{
    private const long SeededByteSize = 4096;

    internal static async Task<SeededGallery> InsertAsync(
        AppDbContext dbContext,
        GallerySeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> calendarEntryIds,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var albums = recorded.Albums.ToDictionary(
            intent => intent.Alias,
            intent => NewAlbum(intent, calendarEntryIds),
            StringComparer.Ordinal
        );
        dbContext.Albums.AddRange(albums.Values);
        await dbContext.SaveChangesAsync(ct);

        var items = recorded.Items.ToDictionary(
            intent => intent.Alias,
            intent => NewItem(intent, albums, personIds, now),
            StringComparer.Ordinal
        );
        dbContext.MediaItems.AddRange(items.Values);
        await dbContext.SaveChangesAsync(ct);

        foreach (var intent in recorded.Albums.Where(intent => intent.CreatedAt is not null))
            albums[intent.Alias].CreatedAt = intent.CreatedAt!.Value;
        foreach (var intent in recorded.Albums.Where(intent => intent.CoverItemAlias is not null))
            albums[intent.Alias].CoverMediaItemId = SeedAliases.RequireId(
                items.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
                intent.CoverItemAlias!,
                "gallery item"
            );
        await dbContext.SaveChangesAsync(ct);

        return new SeededGallery(
            albums.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            items.ToDictionary(entry => entry.Key, entry => entry.Value.Id)
        );
    }

    private static Album NewAlbum(
        GallerySeedBuilder.AlbumIntent intent,
        IReadOnlyDictionary<string, int> calendarEntryIds
    ) =>
        new()
        {
            Title = intent.Title,
            Description = intent.Description,
            CalendarEntryId = intent.CalendarEntryAlias is { } entryAlias
                ? SeedAliases.RequireId(calendarEntryIds, entryAlias, "calendar entry")
                : null,
            SessionStartYear = intent.SessionStartYear,
            PublishedAt = intent.PublishedAt,
            BinnedAt = intent.BinnedAt,
        };

    private static MediaItem NewItem(
        GallerySeedBuilder.GalleryItemIntent intent,
        IReadOnlyDictionary<string, Album> albums,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    )
    {
        var isPhoto = intent.Kind == MediaKind.Photo;
        var isReady = intent.State == MediaItemState.Ready;
        var uploadedAt = intent.UploadedAt ?? now;
        var album = intent.AlbumAlias is { } albumAlias ? albums[albumAlias] : null;

        return new MediaItem
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = MediaOwnerKind.Gallery,
            Kind = intent.Kind,
            State = intent.State,
            OriginalFileName = intent.FileName ?? $"{intent.Alias}{(isPhoto ? ".jpg" : ".mp4")}",
            ContentType = isPhoto ? "image/jpeg" : "video/mp4",
            ByteSize = SeededByteSize,
            Width = isReady ? (isPhoto ? 4000 : 1920) : null,
            Height = isReady ? (isPhoto ? 3000 : 1080) : null,
            DurationSeconds = isReady && !isPhoto ? 12.5 : null,
            CapturedAt = intent.CapturedAt,
            UploadedByPersonId = intent.UploaderAlias is { } uploaderAlias
                ? SeedAliases.RequireId(personIds, uploaderAlias, "person")
                : null,
            UploadedAt = uploadedAt,
            Album = album,
            PlacedAt = album is null ? null : intent.PlacedAt ?? uploadedAt,
            BinnedAt = intent.BinnedAt,
            SelectionPosition = intent.SelectionPosition,
            Caption = intent.Caption,
        };
    }
}
