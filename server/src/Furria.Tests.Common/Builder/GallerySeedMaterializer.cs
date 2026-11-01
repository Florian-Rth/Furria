using System.Text;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;

namespace Furria.Tests.Common.Builder;

internal static class GallerySeedMaterializer
{
    private const long SeededByteSize = 4096;

    private static readonly byte[] MediaKey = Encoding.UTF8.GetBytes(
        ApiTestFixture.MediaSigningKey
    );

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

        var uploadLinks = recorded.UploadLinks.ToDictionary(
            intent => intent.Alias,
            intent => NewUploadLink(intent, personIds, now),
            StringComparer.Ordinal
        );
        dbContext.UploadLinks.AddRange(uploadLinks.Values);
        await dbContext.SaveChangesAsync(ct);
        foreach (var intent in recorded.UploadLinks.Where(intent => intent.ExpiresAt is not null))
            Backdate(uploadLinks[intent.Alias], intent.ExpiresAt!.Value);
        await dbContext.SaveChangesAsync(ct);

        var items = recorded.Items.ToDictionary(
            intent => intent.Alias,
            intent => NewItem(intent, albums, personIds, now),
            StringComparer.Ordinal
        );
        foreach (var intent in recorded.LinkItems)
            items.Add(intent.Alias, NewLinkItem(intent, uploadLinks, now));
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
            items.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            uploadLinks.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            uploadLinks.ToDictionary(
                entry => entry.Key,
                entry => UploadLinkTokens.TokenOf(MediaKey, entry.Value.TokenSeed)
            )
        );
    }

    private static UploadLink NewUploadLink(
        GallerySeedBuilder.UploadLinkIntent intent,
        IReadOnlyDictionary<string, int> personIds,
        DateTimeOffset now
    )
    {
        var seed = $"seed-{intent.Alias}".PadRight(UploadLink.SeedLength, '0')[
            ..UploadLink.SeedLength
        ];

        return new UploadLink
        {
            Title = intent.Title,
            TokenSeed = seed,
            TokenHash = UploadLinkTokens.HashOf(MediaKey, seed),
            CreatedByPersonId = intent.CreatorAlias is { } creatorAlias
                ? SeedAliases.RequireId(personIds, creatorAlias, "person")
                : null,
            ExpiresAt = UploadLink.ExpiryFor(now),
            RevokedAt = intent.RevokedAt,
            UploadedBytes = intent.UploadedBytes,
        };
    }

    private static void Backdate(UploadLink link, DateTimeOffset expiresAt)
    {
        link.CreatedAt = expiresAt - UploadLink.Lifetime;
        link.ExpiresAt = expiresAt;
    }

    private static MediaItem NewLinkItem(
        GallerySeedBuilder.LinkItemIntent intent,
        IReadOnlyDictionary<string, UploadLink> uploadLinks,
        DateTimeOffset now
    )
    {
        var isPhoto = intent.Kind == MediaKind.Photo;

        return new MediaItem
        {
            StorageKey = Guid.NewGuid(),
            OwnerKind = MediaOwnerKind.UploadLink,
            OwnerUploadLink = uploadLinks[intent.UploadLinkAlias],
            Kind = intent.Kind,
            State = MediaItemState.Ready,
            OriginalFileName = $"{intent.Alias}{(isPhoto ? ".jpg" : ".mp4")}",
            ContentType = isPhoto ? "image/jpeg" : "video/mp4",
            ByteSize = SeededByteSize,
            Width = isPhoto ? 4000 : 1920,
            Height = isPhoto ? 3000 : 1080,
            DurationSeconds = isPhoto ? null : 12.5,
            RenderedAt = now,
            UploaderName = intent.UploaderName,
            UploadedAt = now,
        };
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
            RenderedAt = isReady ? uploadedAt : null,
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
