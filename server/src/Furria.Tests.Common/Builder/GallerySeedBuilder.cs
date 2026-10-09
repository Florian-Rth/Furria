using Furria.Core.Media;

namespace Furria.Tests.Common.Builder;

public sealed class GallerySeedBuilder
{
    private readonly List<AlbumIntent> _albums = [];
    private readonly List<GalleryItemIntent> _items = [];

    internal IReadOnlyList<AlbumIntent> Albums => _albums;

    internal IReadOnlyList<GalleryItemIntent> Items => _items;

    public GallerySeedBuilder AddAlbum(
        string alias,
        string title,
        string? calendarEntryAlias = null,
        int? sessionStartYear = null,
        DateTimeOffset? publishedAt = null,
        DateTimeOffset? binnedAt = null,
        string? coverItemAlias = null,
        string? description = null,
        DateTimeOffset? createdAt = null
    )
    {
        _albums.Add(
            new AlbumIntent(
                alias,
                title,
                calendarEntryAlias,
                sessionStartYear,
                publishedAt,
                binnedAt,
                coverItemAlias,
                description,
                createdAt
            )
        );
        return this;
    }

    public GallerySeedBuilder AddGalleryItem(
        string alias,
        string? uploaderAlias = null,
        string? albumAlias = null,
        MediaKind kind = MediaKind.Photo,
        DateTimeOffset? capturedAt = null,
        DateTimeOffset? uploadedAt = null,
        DateTimeOffset? placedAt = null,
        DateTimeOffset? binnedAt = null,
        int? selectionPosition = null,
        string? caption = null,
        MediaItemState state = MediaItemState.Ready,
        string? fileName = null
    )
    {
        _items.Add(
            new GalleryItemIntent(
                alias,
                uploaderAlias,
                albumAlias,
                kind,
                capturedAt,
                uploadedAt,
                placedAt,
                binnedAt,
                selectionPosition,
                caption,
                state,
                fileName
            )
        );
        return this;
    }

    internal sealed record AlbumIntent(
        string Alias,
        string Title,
        string? CalendarEntryAlias,
        int? SessionStartYear,
        DateTimeOffset? PublishedAt,
        DateTimeOffset? BinnedAt,
        string? CoverItemAlias,
        string? Description,
        DateTimeOffset? CreatedAt
    );

    internal sealed record GalleryItemIntent(
        string Alias,
        string? UploaderAlias,
        string? AlbumAlias,
        MediaKind Kind,
        DateTimeOffset? CapturedAt,
        DateTimeOffset? UploadedAt,
        DateTimeOffset? PlacedAt,
        DateTimeOffset? BinnedAt,
        int? SelectionPosition,
        string? Caption,
        MediaItemState State,
        string? FileName
    );
}
