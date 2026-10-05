using System.Diagnostics.Contracts;
using Furria.Application.Start;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private static readonly IReadOnlyDictionary<int, AttendanceAnswer?> NoAnswers =
        new Dictionary<int, AttendanceAnswer?>();

    [Pure]
    private static bool IsHersAndNotDeclined(
        StartEntryRow row,
        AttendanceAnswer? answer,
        CalendarTies ties
    ) => answer != AttendanceAnswer.No && ties.IsHers(row.ToFacts());

    [Pure]
    private static StartEntrySummary ToEntrySummary(
        StartEntryRow row,
        AttendanceAnswer? answer,
        Viewer viewer
    )
    {
        var facts = row.ToFacts();

        return new StartEntrySummary
        {
            CalendarEntryId = row.CalendarEntryId,
            Title = row.Title,
            Kind = row.Kind,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            IsRunning = row.IsRunningAt(viewer.Moment.Now),
            Venue = row.Venue is null ? null : ToVenue(row.Venue),
            ViewerHoldsVenueKey =
                row.Venue is { } venue && viewer.KeyVenueIds.Contains(venue.VenueId),
            OwnerGroup = row.OwnerGroup is null ? null : ToGroupRef(row.OwnerGroup),
            ParticipatingGroups = [.. row.ParticipatingGroups.Select(ToGroupRef)],
            ViewerGroupIds =
            [
                .. row.GroupIds().Where(groupId => IsTiedToGroup(viewer.Ties, groupId)).Distinct(),
            ],
            ViewerRuns = ViewerRunsOf(viewer.Ties, facts),
            Attendance = row.AsksForResponse
                ? AttendanceOf(row, answer, viewer.Ties.Concerns(facts), viewer.Moment.Now)
                : null,
            Description = row.Description,
        };
    }

    [Pure]
    private static List<int> TieGroupIdsOf(CalendarTies ties) =>
        [.. ties.MemberGroupIds.Union(ties.AdminFunctions.Keys)];

    [Pure]
    private static bool IsTiedToGroup(CalendarTies ties, int groupId) =>
        ties.MemberGroupIds.Contains(groupId) || ties.AdminFunctions.ContainsKey(groupId);

    [Pure]
    private static StartRun? ViewerRunsOf(CalendarTies ties, CalendarEntryFacts facts) =>
        ties.RunsVia(facts) is { } groupId
            ? new StartRun { GroupId = groupId, Function = ties.AdminFunctions[groupId] }
            : null;

    [Pure]
    private static StartAttendance AttendanceOf(
        StartEntryRow row,
        AttendanceAnswer? answer,
        bool concernsHer,
        DateTimeOffset now
    ) =>
        new()
        {
            ViewerAnswer = answer,
            IsOwed = concernsHer && row.StartsAt > now && answer is null,
        };

    [Pure]
    private static StartVenue ToVenue(StartVenueRow venue) =>
        new()
        {
            VenueId = venue.VenueId,
            Name = venue.Name,
            Street = venue.Street,
            Zip = venue.Zip,
            City = venue.City,
            Hint = venue.Hint,
        };

    [Pure]
    private static StartGroupRef ToGroupRef(StartGroupRow group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };

    private async Task<IReadOnlyList<StartEntrySummary>> EntryCandidatesAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        var rows = await EntryRowsAsync(viewer, ct);
        var answers = await AnswersOfAsync(
            viewer.PersonId,
            [.. rows.Select(row => row.CalendarEntryId)],
            ct
        );

        return
        [
            .. rows.Where(row =>
                    IsHersAndNotDeclined(
                        row,
                        answers.GetValueOrDefault(row.CalendarEntryId),
                        viewer.Ties
                    )
                )
                .Select(row =>
                    ToEntrySummary(row, answers.GetValueOrDefault(row.CalendarEntryId), viewer)
                ),
        ];
    }

    private Task<List<StartEntryRow>> EntryRowsAsync(Viewer viewer, CancellationToken ct)
    {
        var now = viewer.Moment.Now;
        var openEndedCutoff = now.AddHours(-CalendarDefaults.OpenEndedHours);
        var reachEnd = ClubClock.StartOfDay(
            viewer.Moment.Today.AddDays(StartComposer.NearestReachDays + 1)
        );
        var holdsRunningMembership = viewer.Ties.HoldsRunningMembership;
        var tieGroupIds = TieGroupIdsOf(viewer.Ties);

        return _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry =>
                (entry.OwnerGroupId == null && holdsRunningMembership)
                || (entry.OwnerGroupId != null && tieGroupIds.Contains(entry.OwnerGroupId.Value))
                || entry.ParticipatingGroups.Any(link => tieGroupIds.Contains(link.GroupId))
            )
            .Where(entry =>
                entry.EndsAt == null ? entry.StartsAt > openEndedCutoff : entry.EndsAt > now
            )
            .Where(entry => entry.StartsAt < reachEnd)
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(StartEntryRows.Projection)
            .ToListAsync(ct);
    }

    private async Task<IReadOnlyDictionary<int, AttendanceAnswer?>> AnswersOfAsync(
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
                response => (AttendanceAnswer?)response.Answer,
                ct
            );
    }
}
