using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const int HubSampleCount = 8;

    public async Task<IReadOnlyList<GallerySection>> GetHubAsync(CancellationToken ct)
    {
        var albums = await LiveAlbums()
            .AsNoTracking()
            .Select(album => new HubAlbumRow(
                album.Id,
                album.Title,
                album.CalendarEntry == null ? null : album.CalendarEntry.StartsAt,
                album.SessionStartYear,
                album.PublishedAt != null,
                album.Items.Count(item => item.BinnedAt == null && item.Kind == MediaKind.Photo),
                album.Items.Count(item => item.BinnedAt == null && item.Kind == MediaKind.Video),
                album.Items.Count(item => item.BinnedAt == null && item.SelectionPosition != null),
                album.CreatedAt
            ))
            .ToListAsync(ct);

        var albumIds = albums.Select(album => album.AlbumId).ToList();
        var covers = await _dbContext.AlbumCoversOfAsync(albumIds, ct);
        var samples = await SamplesAsync(ct);
        var sessionNumbers = await SessionNumbersAsync(ct);

        return SectionsOf(
            [.. albums.Select(album => SummaryOf(album, covers, samples))],
            sessionNumbers
        );
    }

    private async Task<ILookup<int, GalleryMediaRef>> SamplesAsync(CancellationToken ct) =>
        (
            await _dbContext
                .Database.SqlQuery<SampleRow>(
                    $"""
                    SELECT ranked.album_id, ranked.media_item_id, ranked.kind, ranked.state,
                           ranked.width, ranked.height, ranked.captured_at
                    FROM (
                        SELECT item.album_id, item.id AS media_item_id, item.kind, item.state,
                               item.width, item.height, item.captured_at,
                               row_number() OVER (
                                   PARTITION BY item.album_id
                                   ORDER BY coalesce(item.captured_at, item.uploaded_at), item.id
                               ) - 1 AS position,
                               count(*) OVER (PARTITION BY item.album_id) AS total
                        FROM media_item item
                        JOIN album ON album.id = item.album_id
                        WHERE album.binned_at IS NULL AND item.binned_at IS NULL
                    ) ranked
                    JOIN generate_series(0, {HubSampleCount - 1}) AS slot(n)
                      ON slot.n < least(ranked.total, {HubSampleCount})
                     AND ranked.position = slot.n * ranked.total / least(ranked.total, {HubSampleCount})
                    ORDER BY ranked.album_id, ranked.position
                    """
                )
                .ToListAsync(ct)
        ).ToLookup(row => row.AlbumId, ToMediaRef);

    private async Task<IReadOnlyDictionary<int, int?>> SessionNumbersAsync(CancellationToken ct) =>
        await _dbContext
            .Sessions.AsNoTracking()
            .ToDictionaryAsync(session => session.StartYear, session => session.Number, ct);

    [Pure]
    private static AlbumSummary SummaryOf(
        HubAlbumRow album,
        IReadOnlyDictionary<int, GalleryMediaRef> covers,
        ILookup<int, GalleryMediaRef> samples
    ) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            EntryStartsAt = album.EntryStartsAt,
            SessionStartYear = AlbumSession.YearOf(album.EntryStartsAt, album.SessionStartYear),
            IsPublished = album.IsPublished,
            Photos = album.Photos,
            Videos = album.Videos,
            SelectionCount = album.SelectionCount,
            CreatedAt = album.CreatedAt,
            Cover = covers.GetValueOrDefault(album.AlbumId),
            Samples = [.. samples[album.AlbumId]],
        };

    [Pure]
    private static IReadOnlyList<GallerySection> SectionsOf(
        IReadOnlyList<AlbumSummary> albums,
        IReadOnlyDictionary<int, int?> sessionNumbers
    ) =>
        [
            .. albums
                .GroupBy(album => album.SessionStartYear)
                .OrderBy(section => section.Key is null)
                .ThenByDescending(section => section.Key)
                .Select(section => new GallerySection
                {
                    SessionStartYear = section.Key,
                    SessionNumber = section.Key is { } year
                        ? sessionNumbers.GetValueOrDefault(year)
                        : null,
                    Albums =
                    [
                        .. section
                            .OrderBy(album => album.EntryStartsAt is null)
                            .ThenByDescending(album => album.EntryStartsAt)
                            .ThenByDescending(album => album.AlbumId),
                    ],
                }),
        ];

    [Pure]
    private static GalleryMediaRef ToMediaRef(SampleRow row) =>
        new()
        {
            MediaItemId = row.MediaItemId,
            Kind = Enum.Parse<MediaKind>(row.Kind),
            State = Enum.Parse<MediaItemState>(row.State),
            Width = row.Width,
            Height = row.Height,
            CapturedAt = row.CapturedAt,
        };

    private sealed record HubAlbumRow(
        int AlbumId,
        string Title,
        DateTimeOffset? EntryStartsAt,
        int? SessionStartYear,
        bool IsPublished,
        int Photos,
        int Videos,
        int SelectionCount,
        DateTimeOffset CreatedAt
    );

    private sealed class SampleRow
    {
        public int AlbumId { get; init; }

        public int MediaItemId { get; init; }

        public string Kind { get; init; } = "";

        public string State { get; init; } = "";

        public int? Width { get; init; }

        public int? Height { get; init; }

        public DateTimeOffset? CapturedAt { get; init; }
    }
}
