using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class AnnouncementService
{
    private const string UnknownAnnouncementMessage = "Diesen Aushang gibt es nicht mehr.";
    private const string ForeignAnnouncementMessage =
        "Diesen Aushang hat jemand anderes geschrieben.";

    private readonly AppDbContext _dbContext;
    private readonly RunningBoardSeats _runningBoardSeats;
    private readonly MediaPictures _pictures;
    private readonly TimeProvider _timeProvider;

    public AnnouncementService(
        AppDbContext dbContext,
        RunningBoardSeats runningBoardSeats,
        MediaPictures pictures,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _runningBoardSeats = runningBoardSeats;
        _pictures = pictures;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<AnnouncementSummary>> GetAnnouncementsAsync(
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Announcements.AsNoTracking()
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Select(AnnouncementRows.Projection)
            .ToListAsync(ct);

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(today, ct);

        return [.. rows.Select(row => ToSummary(row, officeNames, _pictures))];
    }

    public async Task<Result<int>> CreateAsync(
        CreateAnnouncementCommand command,
        CancellationToken ct
    )
    {
        var announcement = new Announcement
        {
            AuthorPersonId = command.AuthorPersonId,
            Title = command.Title,
            Body = command.Body,
            PublishedAt = _timeProvider.GetUtcNow(),
            ValidUntil = command.ValidUntil,
        };

        _dbContext.Announcements.Add(announcement);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(announcement.Id);
    }

    public async Task<Result> UpdateAsync(UpdateAnnouncementCommand command, CancellationToken ct)
    {
        var announcement = await FindAsync(command.AnnouncementId, ct);
        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !MayChange(
                announcement.AuthorPersonId,
                command.ActorPersonId,
                command.ActorMayPostAnnouncements
            )
        )
            return Result.Forbidden(ForeignAnnouncementMessage);

        announcement.Title = command.Title;
        announcement.Body = command.Body;
        announcement.ValidUntil = command.ValidUntil;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> WithdrawAsync(
        WithdrawAnnouncementCommand command,
        CancellationToken ct
    )
    {
        var announcement = await FindAsync(command.AnnouncementId, ct);
        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !MayChange(
                announcement.AuthorPersonId,
                command.ActorPersonId,
                command.ActorMayPostAnnouncements
            )
        )
            return Result.Forbidden(ForeignAnnouncementMessage);

        _dbContext.Announcements.Remove(announcement);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    [Pure]
    private static bool MayChange(int? authorPersonId, int actorPersonId, bool actorMayPost) =>
        actorMayPost || authorPersonId == actorPersonId;

    private static AnnouncementSummary ToSummary(
        AnnouncementRow row,
        IReadOnlyDictionary<int, string> officeNames,
        MediaPictures pictures
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            Body = row.Body,
            PublishedAt = row.PublishedAt,
            ValidUntil = row.ValidUntil,
            Author = row.Author is { } author
                ? new AnnouncementAuthorReference
                {
                    PersonId = author.PersonId,
                    FirstName = author.FirstName,
                    LastName = author.LastName,
                    Portrait = pictures.PortraitOf(
                        author.PersonId,
                        author.PortraitId,
                        author.PortraitRenderedAt
                    ),
                    OfficeName = officeNames.GetValueOrDefault(author.PersonId),
                }
                : null,
        };

    private Task<Announcement?> FindAsync(int announcementId, CancellationToken ct) =>
        _dbContext.Announcements.SingleOrDefaultAsync(row => row.Id == announcementId, ct);
}
