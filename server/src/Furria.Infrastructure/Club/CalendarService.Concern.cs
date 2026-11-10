using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private const string NotMeantForYouMessage =
        "Dieser Termin ist nicht für dich gedacht. Antworten können nur die, für die er ist.";

    private async Task<Result?> AnswerRefusalAsync(
        int actorAccountId,
        CalendarEntryFacts entry,
        CalendarTies ties,
        CancellationToken ct
    ) =>
        ties.IsHers(entry) || await MayOwnAsync(actorAccountId, entry.OwnerGroupId, ct)
            ? null
            : Result.Forbidden(NotMeantForYouMessage);

    private async Task<OrganisedOwners> OrganisedOwnersAsync(
        int viewerAccountId,
        IEnumerable<EntryRow> rows,
        CancellationToken ct
    )
    {
        var owners = rows.Select(row => row.OwnerGroupId).Distinct().ToList();
        var groupIds = new HashSet<int>();
        var club = false;

        foreach (var owner in owners)
        {
            if (!await MayOwnAsync(viewerAccountId, owner, ct))
                continue;

            if (owner is { } groupId)
                groupIds.Add(groupId);
            else
                club = true;
        }

        return new OrganisedOwners(groupIds, club);
    }

    [Pure]
    private static bool MayAnswer(EntryRow row, CalendarTies ties, OrganisedOwners organised) =>
        ties.IsHers(FactsOf(row)) || organised.Includes(row.OwnerGroupId);

    private async Task<EntryConcern> ConcernOfAsync(
        EntryRow row,
        EntryExtras extras,
        bool organises,
        DateOnly today,
        CancellationToken ct
    )
    {
        var polls = extras.Polls.GetValueOrDefault(row.CalendarEntryId, []);
        var lists = extras.SignUpLists.GetValueOrDefault(row.CalendarEntryId, []);

        if (!row.AsksForResponse && polls.Count == 0 && lists.Count == 0)
            return new EntryConcern(extras, null);

        var concerned = await ConcernedPeopleOfAsync(FactsOf(row), today, ct);
        var voters = await VotersOfAsync([.. polls.Select(poll => poll.Details.PollId)], ct);
        var concernedExtras = extras with
        {
            Polls = new Dictionary<int, IReadOnlyList<PlacedPoll>>
            {
                [row.CalendarEntryId] =
                [
                    .. polls.Select(poll =>
                        poll with
                        {
                            Details = WithConcern(
                                poll.Details,
                                concerned,
                                voters[poll.Details.PollId].ToHashSet(),
                                organises
                            ),
                        }
                    ),
                ],
            },
            SignUpLists = new Dictionary<int, IReadOnlyList<PlacedSignUpList>>
            {
                [row.CalendarEntryId] =
                [
                    .. lists.Select(list =>
                        list with
                        {
                            Details = WithConcern(list.Details, concerned, organises),
                        }
                    ),
                ],
            },
        };

        return new EntryConcern(
            concernedExtras,
            row.AsksForResponse
                ? await AttendanceRollOfAsync(row.CalendarEntryId, concerned, organises, ct)
                : null
        );
    }

    private async Task<AttendanceRoll> AttendanceRollOfAsync(
        int calendarEntryId,
        IReadOnlyList<CalendarAttendancePerson> concerned,
        bool organises,
        CancellationToken ct
    )
    {
        var answers = await AnswersOnAsync(calendarEntryId, ct);

        return new AttendanceRoll(
            answers,
            organises
                ? MissingFrom(concerned, answers.Select(answer => answer.PersonId).ToHashSet())
                : null
        );
    }

    private async Task<ILookup<int, int>> VotersOfAsync(
        IReadOnlyList<int> pollIds,
        CancellationToken ct
    )
    {
        if (pollIds.Count == 0)
            return Array.Empty<int>().ToLookup(id => id);

        var votes = await _dbContext
            .CalendarPollVotes.AsNoTracking()
            .Where(vote => pollIds.Contains(vote.PollId))
            .Select(vote => new { vote.PollId, vote.PersonId })
            .Distinct()
            .ToListAsync(ct);

        return votes.ToLookup(vote => vote.PollId, vote => vote.PersonId);
    }

    [Pure]
    private static CalendarPollDetails WithConcern(
        CalendarPollDetails poll,
        IReadOnlyList<CalendarAttendancePerson> concerned,
        IReadOnlySet<int> voterIds,
        bool organises
    ) =>
        poll with
        {
            ConcernedCount = concerned.Count,
            NotAnswered = organises ? MissingFrom(concerned, voterIds) : null,
        };

    [Pure]
    private static CalendarSignUpListDetails WithConcern(
        CalendarSignUpListDetails list,
        IReadOnlyList<CalendarAttendancePerson> concerned,
        bool organises
    ) =>
        list with
        {
            ConcernedCount = concerned.Count,
            NotAnswered = organises
                ? MissingFrom(concerned, list.Lines.Select(line => line.PersonId).ToHashSet())
                : null,
        };

    [Pure]
    private static IReadOnlyList<CalendarAttendancePerson> MissingFrom(
        IReadOnlyList<CalendarAttendancePerson> concerned,
        IReadOnlySet<int> answeredIds
    ) => [.. concerned.Where(person => !answeredIds.Contains(person.PersonId))];

    private sealed record OrganisedOwners(IReadOnlySet<int> GroupIds, bool Club)
    {
        [Pure]
        public bool Includes(int? ownerGroupId) =>
            ownerGroupId is { } groupId ? GroupIds.Contains(groupId) : Club;
    }

    private sealed record EntryConcern(EntryExtras Extras, AttendanceRoll? Roll);
}
