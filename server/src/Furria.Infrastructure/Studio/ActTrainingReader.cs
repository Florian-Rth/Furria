using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActTrainingReader
{
    private static readonly CalendarEntryKind[] TrainingKinds =
    [
        CalendarEntryKind.Training,
        CalendarEntryKind.Rehearsal,
    ];

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public ActTrainingReader(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<StudioTrainingDetails>> TrainingsOfAsync(
        ActSummary act,
        IReadOnlyList<StudioSpotDetails> spots,
        CancellationToken ct
    )
    {
        if (
            act.Group is not { } group
            || act.SessionYear is not { } sessionYear
            || !ActStudioGate.IsEditable(act)
        )
            return [];

        var trainings = await ComingTrainingsAsync(group.GroupId, sessionYear, ct);
        var declined = await DeclinedAsync(trainings, HolderIdsOf(spots), ct);

        return
        [
            .. trainings.Select(training => new StudioTrainingDetails
            {
                CalendarEntryId = training.Id,
                Title = training.Title,
                StartsAt = training.StartsAt,
                AsksForResponse = training.AsksForResponse,
                OpenSpotIds =
                [
                    .. spots
                        .Where(spot =>
                            spot.Person is { } person
                            && declined.Contains((training.Id, person.PersonId))
                        )
                        .Select(spot => spot.SpotId),
                ],
            }),
        ];
    }

    private async Task<IReadOnlyList<TrainingRow>> ComingTrainingsAsync(
        int groupId,
        int sessionYear,
        CancellationToken ct
    )
    {
        var from = ClubClock.StartOfDay(ClubClock.Today(_timeProvider));
        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry =>
                TrainingKinds.Contains(entry.Kind)
                && entry.StartsAt >= from
                && (
                    entry.OwnerGroupId == groupId
                    || entry.ParticipatingGroups.Any(participant => participant.GroupId == groupId)
                )
            )
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(entry => new TrainingRow(
                entry.Id,
                entry.Title,
                entry.StartsAt,
                entry.AsksForResponse
            ))
            .ToListAsync(ct);

        return
        [
            .. rows.Where(row =>
                ClubSession.RelevantYearOf(ClubClock.DayOf(row.StartsAt)) == sessionYear
            ),
        ];
    }

    private async Task<IReadOnlySet<(int CalendarEntryId, int PersonId)>> DeclinedAsync(
        IReadOnlyList<TrainingRow> trainings,
        IReadOnlyList<int> people,
        CancellationToken ct
    )
    {
        var entryIds = trainings
            .Where(training => training.AsksForResponse)
            .Select(training => training.Id)
            .ToList();
        if (entryIds.Count == 0 || people.Count == 0)
            return new HashSet<(int, int)>();

        var rows = await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                entryIds.Contains(response.CalendarEntryId)
                && people.Contains(response.PersonId)
                && response.Answer == AttendanceAnswer.No
            )
            .Select(response => new { response.CalendarEntryId, response.PersonId })
            .ToListAsync(ct);

        return rows.Select(row => (row.CalendarEntryId, row.PersonId)).ToHashSet();
    }

    [Pure]
    private static IReadOnlyList<int> HolderIdsOf(IReadOnlyList<StudioSpotDetails> spots) =>
        [.. spots.Select(spot => spot.Person?.PersonId).OfType<int>().Distinct()];

    private sealed record TrainingRow(
        int Id,
        string Title,
        DateTimeOffset StartsAt,
        bool AsksForResponse
    );
}
