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
        CalendarTies ties,
        CancellationToken ct
    )
    {
        var owners = rows.Where(row => !ties.IsHers(FactsOf(row)))
            .Select(row => row.OwnerGroupId)
            .Distinct()
            .ToList();
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
        ConcernViewer viewer,
        DateOnly today,
        CancellationToken ct
    )
    {
        var polls = extras.Polls.GetValueOrDefault(row.CalendarEntryId, []);
        var lists = extras.SignUpLists.GetValueOrDefault(row.CalendarEntryId, []);

        if (!row.AsksForResponse && polls.Count == 0 && lists.Count == 0)
            return new EntryConcern(extras, null);

        var organises = viewer.Organises;
        var concerned = await ConcernedIdsOfAsync(FactsOf(row), today, ct);
        var named = organises
            ? await _dbContext.PeopleNamedAsync(concerned, ct)
            : AddOnConcern.NobodyNamed;
        var reachable = organises
            ? await _dbContext.ReachablePersonIdsAsync(concerned, viewer.PersonId, ct)
            : AddOnConcern.NobodyReachable;
        var concernedExtras = extras with
        {
            Polls = new Dictionary<int, IReadOnlyList<PlacedPoll>>
            {
                [row.CalendarEntryId] =
                [
                    .. polls.Select(poll =>
                        poll with
                        {
                            Details = poll.Details with
                            {
                                ConcernedCount = AddOnConcern.ShareTotalOf(
                                    concerned,
                                    poll.VoterIds
                                ),
                                NotAnswered = organises
                                    ? AddOnConcern.MissingFrom(named, poll.VoterIds)
                                    : null,
                                Reminder = organises
                                    ? AddOnConcern.ReminderOf(
                                        poll.LastRemindedAt,
                                        reachable,
                                        poll.VoterIds
                                    )
                                    : null,
                            },
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
                            Details = WithConcern(list.Details, concerned, named, organises) with
                            {
                                Reminder = organises
                                    ? AddOnConcern.ReminderOf(
                                        list.LastRemindedAt,
                                        reachable,
                                        AddOnConcern.SignedUpIdsOf(list.Details)
                                    )
                                    : null,
                            },
                        }
                    ),
                ],
            },
        };

        return new EntryConcern(
            concernedExtras,
            row.AsksForResponse
                ? await AttendanceRollOfAsync(row.CalendarEntryId, named, reachable, organises, ct)
                : null
        );
    }

    private async Task<AttendanceRoll> AttendanceRollOfAsync(
        int calendarEntryId,
        IReadOnlyList<CalendarAttendancePerson> named,
        IReadOnlySet<int> reachable,
        bool organises,
        CancellationToken ct
    )
    {
        var answers = await AnswersOnAsync(calendarEntryId, ct);
        var answeredIds = answers.Select(answer => answer.PersonId).ToHashSet();

        return new AttendanceRoll(
            answers,
            organises ? AddOnConcern.MissingFrom(named, answeredIds) : null,
            organises
                ? AddOnConcern.ReminderOf(
                    await AttendanceLastRemindedAtAsync(calendarEntryId, ct),
                    reachable,
                    answeredIds
                )
                : null
        );
    }

    [Pure]
    private static SignUpListDetails WithConcern(
        SignUpListDetails list,
        IReadOnlySet<int> concerned,
        IReadOnlyList<CalendarAttendancePerson> named,
        bool organises
    )
    {
        var signedUpIds = AddOnConcern.SignedUpIdsOf(list);

        return list with
        {
            ConcernedCount = AddOnConcern.ShareTotalOf(concerned, signedUpIds),
            NotAnswered = organises ? AddOnConcern.MissingFrom(named, signedUpIds) : null,
        };
    }

    private Task<DateTimeOffset?> AttendanceLastRemindedAtAsync(
        int calendarEntryId,
        CancellationToken ct
    ) =>
        _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => entry.Id == calendarEntryId)
            .Select(entry => entry.AttendanceLastRemindedAt)
            .SingleOrDefaultAsync(ct);

    private sealed record OrganisedOwners(IReadOnlySet<int> GroupIds, bool Club)
    {
        public static readonly OrganisedOwners Nobody = new(new HashSet<int>(), false);

        [Pure]
        public static OrganisedOwners Of(int? ownerGroupId, bool organises) =>
            !organises ? Nobody
            : ownerGroupId is { } groupId ? new OrganisedOwners(new HashSet<int> { groupId }, false)
            : new OrganisedOwners(new HashSet<int>(), true);

        [Pure]
        public bool Includes(int? ownerGroupId) =>
            ownerGroupId is { } groupId ? GroupIds.Contains(groupId) : Club;
    }

    private sealed record EntryConcern(EntryExtras Extras, AttendanceRoll? Roll);

    private sealed record ConcernViewer(int? PersonId, bool Organises);
}
