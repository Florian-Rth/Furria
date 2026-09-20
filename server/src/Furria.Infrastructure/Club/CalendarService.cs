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
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage =
        "Ein archivierter Ort kann nicht mehr gewählt werden.";
    private const string UnknownOwnerGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string ClubEntryCannotBeGroupOnlyMessage =
        "Ein Eintrag des Vereins kann nicht gruppenintern sein.";

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
        VenueCollisionQuery query,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var startsAt = query.StartsAt;
        var venueId = query.VenueId;
        var excludeCalendarEntryId = query.ExcludeCalendarEntryId;
        var probeEnd = query.EndsAt ?? startsAt.AddHours(CalendarDefaults.OpenEndedHours);
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
            .Where(VisibleTo(query.ViewerPersonId, today))
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(RowProjection(now, openEndedCutoff))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, NoAnswers))];
    }

    public Task<CalendarEntryOwnership?> OwnershipOfAsync(
        int calendarEntryId,
        CancellationToken ct
    ) =>
        _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.Id == calendarEntryId)
            .Select(entry => new CalendarEntryOwnership
            {
                CalendarEntryId = entry.Id,
                OwnerGroupId = entry.OwnerGroupId,
            })
            .SingleOrDefaultAsync(ct);

    public async Task<Result<CalendarEntryWriteResult>> CreateAsync(
        CreateCalendarEntryCommand command,
        CancellationToken ct
    )
    {
        var refusal = await PlacementRefusalAsync(
            new Placement(command.OwnerGroupId, command.VenueId, command.Visibility),
            ct
        );

        if (refusal is not null)
            return Result<CalendarEntryWriteResult>.Validation(refusal);

        var entry = new CalendarEntry
        {
            Title = command.Title,
            Description = command.Description,
            OwnerGroupId = command.OwnerGroupId,
            VenueId = command.VenueId,
            StartsAt = command.StartsAt,
            EndsAt = command.EndsAt,
            Kind = command.Kind,
            Visibility = command.Visibility,
            AsksForResponse = command.AsksForResponse,
        };

        _dbContext.CalendarEntries.Add(entry);
        await _dbContext.SaveChangesAsync(ct);

        return Result<CalendarEntryWriteResult>.Success(
            await WrittenAsync(entry, command.ViewerPersonId, ct)
        );
    }

    public async Task<Result<CalendarEntryWriteResult>> UpdateAsync(
        UpdateCalendarEntryCommand command,
        CancellationToken ct
    )
    {
        var entry = await _dbContext.CalendarEntries.SingleOrDefaultAsync(
            row => row.Id == command.CalendarEntryId,
            ct
        );

        if (entry is null)
            return Result<CalendarEntryWriteResult>.NotFound(UnknownEntryMessage);

        var refusal = await PlacementRefusalAsync(
            new Placement(command.OwnerGroupId, command.VenueId, command.Visibility),
            ct
        );

        if (refusal is not null)
            return Result<CalendarEntryWriteResult>.Validation(refusal);

        entry.Title = command.Title;
        entry.Description = command.Description;
        entry.OwnerGroupId = command.OwnerGroupId;
        entry.VenueId = command.VenueId;
        entry.StartsAt = command.StartsAt;
        entry.EndsAt = command.EndsAt;
        entry.Kind = command.Kind;
        entry.Visibility = command.Visibility;
        entry.AsksForResponse = command.AsksForResponse;

        await _dbContext.SaveChangesAsync(ct);

        return Result<CalendarEntryWriteResult>.Success(
            await WrittenAsync(entry, command.ViewerPersonId, ct)
        );
    }

    public async Task<Result> DeleteAsync(int calendarEntryId, CancellationToken ct)
    {
        var entry = await _dbContext.CalendarEntries.SingleOrDefaultAsync(
            row => row.Id == calendarEntryId,
            ct
        );

        if (entry is null)
            return Result.NotFound(UnknownEntryMessage);

        _dbContext.CalendarEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
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
            entry.VenueId,
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
            VenueId = row.VenueId,
            VenueName = row.VenueName,
            OwnerGroupId = row.OwnerGroupId,
            OwnerGroupName = row.OwnerGroupName,
            Visibility = row.Visibility,
            AsksForResponse = row.AsksForResponse,
            Description = row.Description,
            ViewerAnswer = answers.TryGetValue(row.CalendarEntryId, out var answer) ? answer : null,
            IsRunning = row.IsRunning,
        };

    private async Task<CalendarEntryWriteResult> WrittenAsync(
        CalendarEntry entry,
        int viewerPersonId,
        CancellationToken ct
    ) =>
        new()
        {
            CalendarEntryId = entry.Id,
            VenueCollisions = await CollisionsOfAsync(entry, viewerPersonId, ct),
        };

    private async Task<IReadOnlyList<CalendarEntrySummary>> CollisionsOfAsync(
        CalendarEntry entry,
        int viewerPersonId,
        CancellationToken ct
    )
    {
        if (entry.VenueId is not { } venueId)
            return [];

        return await FindVenueCollisionsAsync(
            new VenueCollisionQuery
            {
                ViewerPersonId = viewerPersonId,
                VenueId = venueId,
                StartsAt = entry.StartsAt,
                EndsAt = entry.EndsAt,
                ExcludeCalendarEntryId = entry.Id,
            },
            ct
        );
    }

    private async Task<string?> PlacementRefusalAsync(Placement placement, CancellationToken ct)
    {
        if (placement.OwnerGroupId is null && placement.Visibility == CalendarEntryVisibility.Group)
            return ClubEntryCannotBeGroupOnlyMessage;

        if (placement.OwnerGroupId is { } ownerGroupId && !await GroupExistsAsync(ownerGroupId, ct))
            return UnknownOwnerGroupMessage;

        if (placement.VenueId is not { } venueId)
            return null;

        var venue = await _dbContext
            .Venues.AsNoTracking()
            .Where(row => row.Id == venueId)
            .Select(row => new VenueStateRow(row.Id, row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

        if (venue is null)
            return UnknownVenueMessage;

        return venue.ArchivedOn is null ? null : ArchivedVenueMessage;
    }

    private Task<bool> GroupExistsAsync(int groupId, CancellationToken ct) =>
        _dbContext.Groups.AsNoTracking().AnyAsync(group => group.Id == groupId, ct);

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
        int? VenueId,
        string? VenueName,
        int? OwnerGroupId,
        string? OwnerGroupName,
        CalendarEntryVisibility Visibility,
        bool AsksForResponse,
        string? Description,
        bool IsRunning
    );

    private sealed record EntryStateRow(int CalendarEntryId, bool AsksForResponse);

    private sealed record VenueStateRow(int VenueId, DateOnly? ArchivedOn);

    private readonly record struct Placement(
        int? OwnerGroupId,
        int? VenueId,
        CalendarEntryVisibility Visibility
    );
}
