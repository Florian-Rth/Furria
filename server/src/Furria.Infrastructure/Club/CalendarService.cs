using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class CalendarService
{
    private const string UnknownEntryMessage = "Diesen Kalendereintrag gibt es nicht.";
    private const string NoResponseWantedMessage = "Dieser Eintrag fragt nicht nach einer Antwort.";
    private const string DuplicateResponseMessage = WriteConflictMessages.DuplicateZusage;

    private static readonly IReadOnlyDictionary<int, AttendanceAnswer> NoAnswers =
        new Dictionary<int, AttendanceAnswer>();

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public CalendarService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<CalendarEntrySummary>> GetEntriesAsync(
        int personId,
        bool clubOwnedOnly,
        int? ownerGroupId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var windowStart = ClubClock.StartOfDay(from);
        var windowEnd = ClubClock.StartOfDay(to.AddDays(1));

        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.StartsAt >= windowStart && entry.StartsAt < windowEnd)
            .Where(entry => !clubOwnedOnly || entry.OwnerGroupId == null)
            .Where(entry => ownerGroupId == null || entry.OwnerGroupId == ownerGroupId)
            .Where(VisibleTo(personId, today))
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, openEndedCutoff))
            .ToListAsync(ct);

        var answers = await AnswersOfAsync(
            personId,
            [.. rows.Select(row => row.CalendarEntryId)],
            ct
        );

        return [.. rows.Select(row => ToSummary(row, answers))];
    }

    public async Task<IReadOnlyList<CalendarEntrySummary>> FindVenueCollisionsAsync(
        int venueId,
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt,
        int? excludeCalendarEntryId,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var probeEnd = endsAt ?? startsAt.AddHours(CalendarDefaults.OpenEndedHours);
        var probeStartLessOpenEnded = startsAt.AddHours(-CalendarDefaults.OpenEndedHours);

        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.VenueId == venueId)
            .Where(entry =>
                excludeCalendarEntryId == null || entry.Id != excludeCalendarEntryId.Value
            )
            .Where(entry =>
                entry.StartsAt < probeEnd
                && (
                    entry.EndsAt == null
                        ? entry.StartsAt > probeStartLessOpenEnded
                        : entry.EndsAt > startsAt
                )
            )
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, openEndedCutoff))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, NoAnswers))];
    }

    public async Task<Result> SetResponseAsync(
        SetAttendanceResponseCommand command,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var entry = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(row => row.Id == command.CalendarEntryId)
            .Where(VisibleTo(command.PersonId, today))
            .Select(row => new EntryStateRow(row.Id, row.AsksForResponse))
            .SingleOrDefaultAsync(ct);

        if (entry is null)
            return Result.NotFound(UnknownEntryMessage);

        if (!entry.AsksForResponse)
            return Result.Validation(NoResponseWantedMessage);

        var recorded = await _dbContext.AttendanceResponses.SingleOrDefaultAsync(
            response =>
                response.CalendarEntryId == command.CalendarEntryId
                && response.PersonId == command.PersonId,
            ct
        );

        if (recorded is null)
        {
            _dbContext.AttendanceResponses.Add(
                new AttendanceResponse
                {
                    CalendarEntryId = command.CalendarEntryId,
                    PersonId = command.PersonId,
                    Answer = command.Answer,
                }
            );
        }
        else
        {
            recorded.Answer = command.Answer;
        }

        var saved = await _dbContext.SaveOrConflictAsync(ct);

        return saved.IsSuccess ? Result.Success() : Result.Conflict(DuplicateResponseMessage);
    }

    [Pure]
    private static Expression<Func<CalendarEntry, bool>> VisibleTo(int personId, DateOnly today) =>
        entry =>
            entry.Visibility != CalendarEntryVisibility.Group
            || entry.OwnerGroup!.Memberships.Any(membership =>
                membership.PersonId == personId
                && membership.JoinedOn <= today
                && (membership.LeftOn == null || membership.LeftOn >= today)
            )
            || entry.OwnerGroup!.Admins.Any(admin =>
                admin.PersonId == personId
                && admin.SinceOn <= today
                && (admin.UntilOn == null || admin.UntilOn >= today)
            );

    [Pure]
    private static Expression<Func<CalendarEntry, EntryRow>> RowProjection(
        DateTimeOffset now,
        DateTimeOffset openEndedCutoff
    ) =>
        entry => new EntryRow(
            entry.Id,
            entry.Title,
            entry.StartsAt,
            entry.EndsAt,
            entry.Kind,
            entry.Venue!.Name,
            entry.OwnerGroupId,
            entry.OwnerGroup!.Name,
            entry.Visibility,
            entry.AsksForResponse,
            entry.Description,
            entry.StartsAt <= now
                && (entry.EndsAt == null ? entry.StartsAt > openEndedCutoff : entry.EndsAt > now)
        );

    [Pure]
    private static CalendarEntrySummary ToSummary(
        EntryRow row,
        IReadOnlyDictionary<int, AttendanceAnswer> answers
    ) =>
        new()
        {
            CalendarEntryId = row.CalendarEntryId,
            Title = row.Title,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            Kind = row.Kind,
            VenueName = row.VenueName,
            OwnerGroupId = row.OwnerGroupId,
            OwnerGroupName = row.OwnerGroupName,
            Visibility = row.Visibility,
            AsksForResponse = row.AsksForResponse,
            Description = row.Description,
            ViewerAnswer = answers.TryGetValue(row.CalendarEntryId, out var answer) ? answer : null,
            IsRunning = row.IsRunning,
        };

    private async Task<IReadOnlyDictionary<int, AttendanceAnswer>> AnswersOfAsync(
        int personId,
        IReadOnlyList<int> calendarEntryIds,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return NoAnswers;

        return await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                response.PersonId == personId && calendarEntryIds.Contains(response.CalendarEntryId)
            )
            .ToDictionaryAsync(
                response => response.CalendarEntryId,
                response => response.Answer,
                ct
            );
    }

    private sealed record EntryRow(
        int CalendarEntryId,
        string Title,
        DateTimeOffset StartsAt,
        DateTimeOffset? EndsAt,
        CalendarEntryKind Kind,
        string? VenueName,
        int? OwnerGroupId,
        string? OwnerGroupName,
        CalendarEntryVisibility Visibility,
        bool AsksForResponse,
        string? Description,
        bool IsRunning
    );

    private sealed record EntryStateRow(int CalendarEntryId, bool AsksForResponse);
}
