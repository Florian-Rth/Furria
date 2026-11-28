using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string NotLeadingTheTrainingMessage =
        "Für andere trägt nur die Leitung einer Gruppe dieses Trainings ein.";
    private const string NoComingTrainingMessage =
        "Für andere eintragen geht nur bei kommenden Trainings mit Zu-/Absage.";
    private const string NotInLedGroupMessage =
        "Diese Person ist in keiner Gruppe, die du für dieses Training leitest.";
    private const string NothingMarkedMessage = "Für diese Person ist nichts eingetragen.";
    private const string AnsweredHerselfMessage =
        "Sie hat inzwischen selbst geantwortet – ihre Antwort bleibt.";
    private const string MarkedMeanwhileMessage =
        "Gerade wurde für diese Person schon etwas eingetragen. Lade neu.";

    public async Task<Result> MarkAsync(MarkAttendanceCommand command, CancellationToken ct)
    {
        var target = new MarkTarget(
            command.ActorAccountId,
            command.CalendarEntryId,
            command.PersonId
        );
        var recorder = await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.ShareLockEntryAsync(target.CalendarEntryId, ct);
        if (await MarkRefusalAsync(target, ct) is { } refusal)
            return refusal;

        _dbContext.Record(
            await _dbContext.LockedResponseAsync(target.CalendarEntryId, target.PersonId, ct),
            new AttendanceRecord(
                target.CalendarEntryId,
                target.PersonId,
                command.Answer,
                IsRecordedOnBehalf: true,
                RecordedByPersonId: recorder
            ),
            _timeProvider.GetUtcNow()
        );

        return await MarkCommittedAsync(transaction, ct);
    }

    public async Task<Result> WithdrawMarkAsync(
        WithdrawAttendanceMarkCommand command,
        CancellationToken ct
    )
    {
        var target = new MarkTarget(
            command.ActorAccountId,
            command.CalendarEntryId,
            command.PersonId
        );
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.ShareLockEntryAsync(target.CalendarEntryId, ct);
        if (await MarkRefusalAsync(target, ct) is { } refusal)
            return refusal;

        var recorded = await _dbContext.LockedResponseAsync(
            target.CalendarEntryId,
            target.PersonId,
            ct
        );
        if (recorded is null)
            return Result.NotFound(NothingMarkedMessage);
        if (!recorded.IsRecordedOnBehalf)
            return Result.Conflict(AnsweredHerselfMessage);

        var trail = await _dbContext
            .AttendanceResponseChanges.Where(change =>
                change.CalendarEntryId == target.CalendarEntryId
                && change.PersonId == target.PersonId
            )
            .OrderByDescending(change => change.Id)
            .Take(2)
            .ToListAsync(ct);

        if (trail.FirstOrDefault() is not { IsRecordedOnBehalf: true } mark)
            return Result.Conflict(MarkedMeanwhileMessage);

        _dbContext.AttendanceResponseChanges.Remove(mark);

        if (trail.Skip(1).FirstOrDefault() is { } previous)
            RestoreTo(recorded, previous);
        else
            _dbContext.AttendanceResponses.Remove(recorded);

        return await MarkCommittedAsync(transaction, ct);
    }

    private async Task<IReadOnlyList<CalendarMarkablePerson>?> MarkableOfAsync(
        int viewerAccountId,
        CalendarEntryFacts entry,
        int calendarEntryId,
        CancellationToken ct
    )
    {
        if (!entry.TakesMarksOn(ClubClock.Today(_timeProvider)))
            return null;

        var ledGroupIds = await LedGroupIdsOfAsync(viewerAccountId, entry, ct);
        if (ledGroupIds.Count == 0)
            return null;

        var members = await MembersOnTheDayAsync(ledGroupIds, entry.StartsAt, ct);
        var memberIds = members.Select(member => member.PersonId).ToList();
        var answers = await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                response.CalendarEntryId == calendarEntryId && memberIds.Contains(response.PersonId)
            )
            .ToDictionaryAsync(response => response.PersonId, response => response.Answer, ct);
        var trails = await TrailsOfAsync(calendarEntryId, memberIds, ct);

        return
        [
            .. members.Select(member => new CalendarMarkablePerson
            {
                PersonId = member.PersonId,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Answer = answers.TryGetValue(member.PersonId, out var answer) ? answer : null,
                Trail = [.. trails[member.PersonId]],
            }),
        ];
    }

    private async Task<Result?> MarkRefusalAsync(MarkTarget target, CancellationToken ct)
    {
        var entry = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(row => row.Id == target.CalendarEntryId)
            .Select(EntryFactsRows.Projection)
            .SingleOrDefaultAsync(ct);
        if (entry?.ToFacts() is not { } facts)
            return Result.NotFound(UnknownEntryMessage);

        var ledGroupIds = await LedGroupIdsOfAsync(target.ActorAccountId, facts, ct);
        if (ledGroupIds.Count == 0)
            return Result.Forbidden(NotLeadingTheTrainingMessage);
        if (!facts.TakesMarksOn(ClubClock.Today(_timeProvider)))
            return Result.Validation(NoComingTrainingMessage);

        return await IsMemberOnTheDayAsync(target.PersonId, ledGroupIds, facts.StartsAt, ct)
            ? null
            : Result.NotFound(NotInLedGroupMessage);
    }

    private async Task<IReadOnlyList<int>> LedGroupIdsOfAsync(
        int actorAccountId,
        CalendarEntryFacts entry,
        CancellationToken ct
    )
    {
        var led = new List<int>();
        foreach (var groupId in entry.CastGroupIds().Distinct())
        {
            if (await _authorizer.CanAdministerGroupAsync(actorAccountId, groupId, ct))
                led.Add(groupId);
        }

        return led;
    }

    private Task<bool> IsMemberOnTheDayAsync(
        int personId,
        IReadOnlyList<int> groupIds,
        DateTimeOffset startsAt,
        CancellationToken ct
    ) =>
        _dbContext
            .GroupMemberships.Where(Conferring.GroupMemberships(ClubClock.DayOf(startsAt)))
            .AnyAsync(
                membership =>
                    membership.PersonId == personId && groupIds.Contains(membership.GroupId),
                ct
            );

    private Task<List<CalendarAttendancePerson>> MembersOnTheDayAsync(
        IReadOnlyList<int> groupIds,
        DateTimeOffset startsAt,
        CancellationToken ct
    )
    {
        var memberIds = _dbContext
            .GroupMemberships.Where(Conferring.GroupMemberships(ClubClock.DayOf(startsAt)))
            .Where(membership => groupIds.Contains(membership.GroupId))
            .Select(membership => membership.PersonId);

        return _dbContext
            .People.AsNoTracking()
            .Where(person => memberIds.Contains(person.Id))
            .OrderBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new CalendarAttendancePerson
            {
                PersonId = person.Id,
                FirstName = person.FirstName,
                LastName = person.LastName,
            })
            .ToListAsync(ct);
    }

    private async Task<ILookup<int, CalendarAttendanceChangeDetails>> TrailsOfAsync(
        int calendarEntryId,
        IReadOnlyList<int> personIds,
        CancellationToken ct
    )
    {
        var changes = await _dbContext
            .AttendanceResponseChanges.AsNoTracking()
            .Where(change =>
                change.CalendarEntryId == calendarEntryId && personIds.Contains(change.PersonId)
            )
            .OrderByDescending(change => change.Id)
            .Select(change => new
            {
                change.PersonId,
                Details = new CalendarAttendanceChangeDetails
                {
                    Answer = change.Answer,
                    IsRecordedOnBehalf = change.IsRecordedOnBehalf,
                    RecordedByFirstName = change.IsRecordedOnBehalf
                        ? change.RecordedBy!.FirstName
                        : null,
                    RecordedByLastName = change.IsRecordedOnBehalf
                        ? change.RecordedBy!.LastName
                        : null,
                    RecordedAt = change.RecordedAt,
                },
            })
            .ToListAsync(ct);

        return changes.ToLookup(change => change.PersonId, change => change.Details);
    }

    private static void RestoreTo(AttendanceResponse recorded, AttendanceResponseChange previous)
    {
        recorded.Answer = previous.Answer;
        recorded.IsRecordedOnBehalf = previous.IsRecordedOnBehalf;
        recorded.RecordedByPersonId = previous.RecordedByPersonId;
    }

    private async Task<Result> MarkCommittedAsync(
        IDbContextTransaction transaction,
        CancellationToken ct
    )
    {
        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result.Conflict(MarkedMeanwhileMessage);

        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private sealed record MarkTarget(int ActorAccountId, int CalendarEntryId, int PersonId);
}
