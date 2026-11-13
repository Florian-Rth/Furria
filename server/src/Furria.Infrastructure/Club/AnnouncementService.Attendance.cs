using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    private const string NotManagedMessage = "Diesen Aushang darfst du nicht pflegen.";
    private const string NoResponseWantedMessage = "Dieser Aushang fragt nicht nach einer Antwort.";
    private const string NotMeantForYouMessage =
        "Antworten können nur Mitglieder, deren Mitgliedschaft gerade läuft.";
    private const string AnswersClosedMessage = "Antworten sind nicht mehr möglich.";

    public async Task<Result> SetResponseAsync(
        SetAnnouncementResponseCommand command,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct) is not { } personId)
            return Result.Forbidden(NotMeantForYouMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM announcement WHERE id = {command.AnnouncementId} FOR SHARE",
            ct
        );

        if (await ResponseRefusalAsync(command.AnnouncementId, personId, ct) is { } refusal)
            return refusal;

        var response = await _dbContext.AttendanceResponses.SingleOrDefaultAsync(
            row => row.AnnouncementId == command.AnnouncementId && row.PersonId == personId,
            ct
        );

        if (response is null)
        {
            response = new AttendanceResponse
            {
                AnnouncementId = command.AnnouncementId,
                PersonId = personId,
            };
            _dbContext.AttendanceResponses.Add(response);
        }

        response.Answer = command.Answer;

        var saved = await SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return saved;

        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<Result> CloseAttendanceAsync(
        int actorAccountId,
        int announcementId,
        CancellationToken ct
    )
    {
        var closerPersonId = await _authorizer.ActivePersonIdAsync(actorAccountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await LockForUpdateAsync(announcementId, ct);
        var announcement = await _dbContext.Announcements.SingleOrDefaultAsync(
            row => row.Id == announcementId,
            ct
        );

        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !await _authorizer.MayManageAnnouncementAsync(
                actorAccountId,
                announcement.AuthorPersonId,
                ct
            )
        )
            return Result.Forbidden(NotManagedMessage);

        if (announcement.AttendancePosition is null)
            return Result.Validation(NoResponseWantedMessage);

        if (announcement.AttendanceClosedAt is null)
        {
            var closing = AddOnClosing.CloseOf(
                announcement.AnswersUntil,
                AnnouncementAddOns.ClosesAt(announcement.ValidUntil),
                _timeProvider.GetUtcNow(),
                closerPersonId
            );
            announcement.AttendanceClosedAt = closing.ClosedAt;
            announcement.AttendanceClosedByPersonId = closing.ClosedByPersonId;
        }

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    private async Task<Result?> ResponseRefusalAsync(
        int announcementId,
        int personId,
        CancellationToken ct
    )
    {
        var attendance = await _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement => announcement.Id == announcementId)
            .Select(announcement => new AttendanceStateRow(
                announcement.AttendancePosition,
                announcement.AnswersUntil,
                announcement.AttendanceClosedAt,
                announcement.ValidUntil
            ))
            .SingleOrDefaultAsync(ct);

        if (attendance is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (attendance.Position is null)
            return Result.Validation(NoResponseWantedMessage);

        if (
            !await _dbContext.IsConcernedByAnnouncementsAsync(
                personId,
                ClubClock.Today(_timeProvider),
                ct
            )
        )
            return Result.Forbidden(NotMeantForYouMessage);

        return AddOnClosing.IsClosed(
            attendance.ClosedAt,
            attendance.AnswersUntil,
            AnnouncementAddOns.ClosesAt(attendance.ValidUntil),
            _timeProvider.GetUtcNow()
        )
            ? Result.Validation(AnswersClosedMessage)
            : null;
    }

    private Task LockForUpdateAsync(int announcementId, CancellationToken ct) =>
        _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM announcement WHERE id = {announcementId} FOR UPDATE",
            ct
        );

    private async Task<Announcement?> LockedAsync(int announcementId, CancellationToken ct)
    {
        await LockForUpdateAsync(announcementId, ct);

        return await _dbContext
            .Announcements.Include(row => row.Polls)
            .Include(row => row.SignUpLists)
            .AsSplitQuery()
            .SingleOrDefaultAsync(row => row.Id == announcementId, ct);
    }

    private sealed record AttendanceStateRow(
        int? Position,
        DateTimeOffset? AnswersUntil,
        DateTimeOffset? ClosedAt,
        DateOnly? ValidUntil
    );
}
