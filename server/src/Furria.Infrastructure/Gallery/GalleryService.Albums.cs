using System.Diagnostics.Contracts;
using Furria.Application.Gallery;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const string UnknownEntryMessage = "Diesen Kalendereintrag gibt es nicht.";
    private const string FutureSessionMessage = "Diese Session hat noch nicht begonnen.";
    private const string ForeignCoverMessage = "Das Titelbild muss aus diesem Album stammen.";
    private const string NotBinnedMessage = "Dieses Album liegt nicht im Papierkorb.";

    public async Task<AlbumDetails?> GetAlbumAsync(AlbumItemsQuery query, CancellationToken ct)
    {
        var header = await LiveAlbums()
            .AsNoTracking()
            .Where(album => album.Id == query.AlbumId)
            .Select(album => new AlbumHeaderRow(
                album.Id,
                album.Title,
                album.Description,
                album.CalendarEntry == null
                    ? null
                    : new AlbumEntry(
                        album.CalendarEntry.Id,
                        album.CalendarEntry.Title,
                        album.CalendarEntry.StartsAt
                    ),
                album.SessionStartYear,
                album.PublishedAt,
                album.Items.Any(item => item.Id == album.CoverMediaItemId && item.BinnedAt == null)
                    ? album.CoverMediaItemId
                    : null
            ))
            .SingleOrDefaultAsync(ct);
        if (header is null)
            return null;

        var covers = await _dbContext.AlbumCoversOfAsync([query.AlbumId], ct);
        var uploaders = await UploaderCountsAsync(query.AlbumId, ct);

        return new AlbumDetails
        {
            AlbumId = header.AlbumId,
            Title = header.Title,
            Description = header.Description,
            CalendarEntry = header.Entry,
            SessionStartYear = AlbumSession.YearOf(header.Entry?.StartsAt, header.SessionStartYear),
            PublishedAt = header.PublishedAt,
            CoverMediaItemId = covers.GetValueOrDefault(query.AlbumId)?.MediaItemId,
            ChosenCoverMediaItemId = header.ChosenCoverMediaItemId,
            Photos = await LiveItemsOf(query.AlbumId).CountAsync(IsPhoto, ct),
            Videos = await LiveItemsOf(query.AlbumId).CountAsync(IsVideo, ct),
            Uploaders = uploaders,
            Items = await LiveItemsOf(query.AlbumId)
                .AsNoTracking()
                .Where(item => query.Kind == null || item.Kind == query.Kind)
                .Where(item =>
                    query.UploaderPersonId == null
                    || item.UploadedByPersonId == query.UploaderPersonId
                )
                .InCaptureOrder()
                .Select(ItemSummary)
                .ToListAsync(ct),
        };
    }

    public async Task<Result<int>> CreateAlbumAsync(
        CreateAlbumCommand command,
        CancellationToken ct
    )
    {
        var link = await CheckLinkAsync(command.CalendarEntryId, command.SessionStartYear, ct);
        if (!link.IsSuccess)
            return Result<int>.Carrying(link);

        var album = new Album
        {
            Title = command.Title.Trim(),
            Description = TextOrNull(command.Description),
            CalendarEntryId = command.CalendarEntryId,
            SessionStartYear = command.SessionStartYear,
        };
        _dbContext.Albums.Add(album);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(album.Id);
    }

    public async Task<Result> UpdateAlbumAsync(UpdateAlbumCommand command, CancellationToken ct)
    {
        var album = await LiveAlbums().SingleOrDefaultAsync(row => row.Id == command.AlbumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        var link = await CheckLinkAsync(command.CalendarEntryId, command.SessionStartYear, ct);
        if (!link.IsSuccess)
            return link;

        if (
            command.CoverMediaItemId is { } coverId
            && !await LiveItemsOf(album.Id).AnyAsync(item => item.Id == coverId, ct)
        )
            return Result.Validation(ForeignCoverMessage);

        album.Title = command.Title.Trim();
        album.Description = TextOrNull(command.Description);
        album.CalendarEntryId = command.CalendarEntryId;
        album.SessionStartYear = command.SessionStartYear;
        album.CoverMediaItemId = command.CoverMediaItemId;
        if (command.CalendarEntryId is null && command.SessionStartYear is null)
            album.PublishedAt = null;

        await _dbContext.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> BinAlbumAsync(int albumId, CancellationToken ct)
    {
        var album = await LiveAlbums().SingleOrDefaultAsync(row => row.Id == albumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        album.BinnedAt = _timeProvider.GetUtcNow();
        album.PublishedAt = null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreAlbumAsync(int albumId, CancellationToken ct)
    {
        var album = await _dbContext.Albums.SingleOrDefaultAsync(row => row.Id == albumId, ct);
        if (album is null)
            return Result.NotFound(UnknownAlbumMessage);

        if (album.BinnedAt is null)
            return Result.Conflict(NotBinnedMessage);

        album.BinnedAt = null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<bool> IsLiveAlbumAsync(int albumId, CancellationToken ct) =>
        await LiveAlbums().AnyAsync(album => album.Id == albumId, ct);

    public async Task<AlbumZipDetails?> ZipOfAsync(int albumId, CancellationToken ct)
    {
        var title = await LiveAlbums()
            .Where(album => album.Id == albumId)
            .Select(album => album.Title)
            .SingleOrDefaultAsync(ct);
        if (title is null)
            return null;

        var originals = await LiveItemsOf(albumId)
            .AsNoTracking()
            .InCaptureOrder()
            .Select(item => new ZipSourceRow(
                item.StorageKey,
                item.OriginalFileName,
                item.CapturedAt ?? item.UploadedAt
            ))
            .ToListAsync(ct);

        return new AlbumZipDetails
        {
            Title = title,
            Entries =
            [
                .. ZipNames
                    .Distinct([.. originals.Select(row => row.FileName)])
                    .Zip(
                        originals,
                        (name, row) =>
                            new AlbumZipEntry(
                                name,
                                _mediaFiles.OriginalPathOf(row.StorageKey),
                                row.ModifiedAt
                            )
                    ),
            ],
        };
    }

    private async Task<IReadOnlyList<AlbumUploaderCount>> UploaderCountsAsync(
        int albumId,
        CancellationToken ct
    ) => [.. (
                await LiveItemsOf(albumId)
                    .AsNoTracking()
                    .GroupBy(item => new
                    {
                        item.UploadedByPersonId,
                        FirstName = item.UploadedBy == null ? null : item.UploadedBy.FirstName,
                        LastName = item.UploadedBy == null ? null : item.UploadedBy.LastName,
                    })
                    .Select(group => new
                    {
                        group.Key.UploadedByPersonId,
                        group.Key.FirstName,
                        group.Key.LastName,
                        Count = group.Count(),
                    })
                    .ToListAsync(ct)
            ).OrderByDescending(row => row.Count).ThenBy(row => row.UploadedByPersonId is null).ThenBy(row => row.UploadedByPersonId).Select(row => new AlbumUploaderCount(row.UploadedByPersonId is { } personId ? new GalleryUploader(personId, row.FirstName!, row.LastName!) : null, row.Count))];

    private async Task<Result> CheckLinkAsync(
        int? calendarEntryId,
        int? sessionStartYear,
        CancellationToken ct
    )
    {
        if (
            calendarEntryId is { } entryId
            && !await _dbContext.CalendarEntries.AnyAsync(entry => entry.Id == entryId, ct)
        )
            return Result.NotFound(UnknownEntryMessage);

        var relevantYear = ClubSession.RelevantYearOf(ClubClock.Today(_timeProvider));
        return sessionStartYear > relevantYear
            ? Result.Validation(FutureSessionMessage)
            : Result.Success();
    }

    [Pure]
    private static string? TextOrNull(string? text) =>
        string.IsNullOrWhiteSpace(text) ? null : text.Trim();

    private sealed record AlbumHeaderRow(
        int AlbumId,
        string Title,
        string? Description,
        AlbumEntry? Entry,
        int? SessionStartYear,
        DateTimeOffset? PublishedAt,
        int? ChosenCoverMediaItemId
    );

    private sealed record ZipSourceRow(Guid StorageKey, string FileName, DateTimeOffset ModifiedAt);
}
