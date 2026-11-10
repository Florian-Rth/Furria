using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string AnswersClosedMessage =
        "Dieser Termin ist vorbei. Antworten sind nicht mehr möglich.";

    private async Task<AttendanceRoll?> AttendanceRollOfAsync(
        EntryRow row,
        int viewerAccountId,
        DateOnly today,
        CancellationToken ct
    )
    {
        if (!row.AsksForResponse)
            return null;

        var answers = await AnswersOnAsync(row.CalendarEntryId, ct);
        var notAnswered = await MayOwnAsync(viewerAccountId, row.OwnerGroupId, ct)
            ? await NotAnsweredAsync(
                FactsOf(row),
                answers.Select(answer => answer.PersonId).ToHashSet(),
                today,
                ct
            )
            : null;

        return new AttendanceRoll(answers, notAnswered);
    }

    private Task<List<CalendarAttendanceAnswerDetails>> AnswersOnAsync(
        int calendarEntryId,
        CancellationToken ct
    ) =>
        _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response => response.CalendarEntryId == calendarEntryId)
            .OrderBy(response =>
                EF.Functions.Collate(response.Person!.FirstName, GermanCollation.Name)
            )
            .ThenBy(response =>
                EF.Functions.Collate(response.Person!.LastName, GermanCollation.Name)
            )
            .ThenBy(response => response.PersonId)
            .Select(response => new CalendarAttendanceAnswerDetails
            {
                PersonId = response.PersonId,
                FirstName = response.Person!.FirstName,
                LastName = response.Person!.LastName,
                Answer = response.Answer,
                RecordedByFirstName = response.IsRecordedOnBehalf
                    ? response.RecordedBy!.FirstName
                    : null,
                RecordedByLastName = response.IsRecordedOnBehalf
                    ? response.RecordedBy!.LastName
                    : null,
                AnsweredAt = response.UpdatedAt,
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<CalendarAttendancePerson>> NotAnsweredAsync(
        CalendarEntryFacts entry,
        IReadOnlySet<int> answeredPersonIds,
        DateOnly today,
        CancellationToken ct
    )
    {
        var candidateIds = await ConcernCandidateIdsOf(entry, today).Distinct().ToListAsync(ct);
        var ties = await _dbContext.CalendarTiesOfManyAsync(
            [.. candidateIds.Where(personId => !answeredPersonIds.Contains(personId))],
            today,
            ct
        );
        var concernedIds = ConcernedIdsOf(entry, ties);

        return await _dbContext
            .People.AsNoTracking()
            .Where(person => concernedIds.Contains(person.Id))
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

    [Pure]
    private static List<int> ConcernedIdsOf(
        CalendarEntryFacts entry,
        IReadOnlyDictionary<int, CalendarTies> ties
    ) => [.. ties.Where(pair => pair.Value.Concerns(entry)).Select(pair => pair.Key)];

    private IQueryable<int> ConcernCandidateIdsOf(CalendarEntryFacts entry, DateOnly today)
    {
        if (entry.IsForChosenPeople)
        {
            var chosenIds = entry.AudiencePersonIds;
            return _dbContext
                .People.Where(person => chosenIds.Contains(person.Id))
                .Select(person => person.Id);
        }

        var castGroupIds = entry.CastGroupIds().ToList();
        var groupIds = entry.AudienceGroupIds.Concat(castGroupIds).Distinct().ToList();
        var candidates = _dbContext
            .GroupMemberships.Where(Conferring.GroupMemberships(today))
            .Where(membership => groupIds.Contains(membership.GroupId))
            .Select(membership => membership.PersonId)
            .Concat(CastCandidateIdsOf(castGroupIds));

        return entry.Audience == CalendarEntryAudience.Club
            ? candidates.Concat(
                _dbContext
                    .Memberships.Where(Running.Memberships(today))
                    .Select(membership => membership.PersonId)
            )
            : candidates;
    }

    private IQueryable<int> CastCandidateIdsOf(IReadOnlyList<int> castGroupIds)
    {
        var acts = _dbContext.Acts.Where(act =>
            act.ArchivedAt == null
            && act.GroupId != null
            && castGroupIds.Contains(act.GroupId.Value)
        );

        return acts.SelectMany(act => act.FrozenCast.Select(member => member.PersonId))
            .Concat(
                acts.SelectMany(act =>
                    act.CastChanges.Where(change => change.Change == CastChange.Added)
                        .Select(change => change.PersonId)
                )
            );
    }

    private sealed record AttendanceRoll(
        IReadOnlyList<CalendarAttendanceAnswerDetails> Answers,
        IReadOnlyList<CalendarAttendancePerson>? NotAnswered
    );
}
