using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActTrainingReader
{
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
        var trainings = await ComingTrainingsOfAsync(act, ct);
        var castIds = act.Cast.Select(member => member.PersonId).ToList();
        var responses = await ResponsesAsync(trainings, castIds, ct);
        var trails = await TrailsAsync(trainings, castIds, ct);

        return
        [
            .. trainings.Select(training =>
            {
                var answered = responses.Where(response => response.CalendarEntryId == training.Id);

                return new StudioTrainingDetails
                {
                    CalendarEntryId = training.Id,
                    Title = training.Title,
                    StartsAt = training.StartsAt,
                    OpenSpotIds = OpenSpotIdsOf(spots, answered),
                    Responses = [.. answered.Select(response => ToDetails(response, trails))],
                };
            }),
        ];
    }

    public async Task<bool> IsComingTrainingOfAsync(
        ActSummary act,
        int calendarEntryId,
        CancellationToken ct
    ) => (await ComingTrainingsOfAsync(act, calendarEntryId, ct)).Count == 1;

    private async Task<IReadOnlyList<TrainingRow>> ComingTrainingsOfAsync(
        ActSummary act,
        CancellationToken ct
    ) => await ComingTrainingsOfAsync(act, null, ct);

    private async Task<IReadOnlyList<TrainingRow>> ComingTrainingsOfAsync(
        ActSummary act,
        int? onlyCalendarEntryId,
        CancellationToken ct
    )
    {
        if (
            act.Group is not { } group
            || act.SessionYear is not { } sessionYear
            || !ActStudioGate.IsEditable(act)
        )
            return [];

        var groupId = group.GroupId;
        var from = ClubClock.StartOfDay(ClubClock.Today(_timeProvider));
        var kinds = CastAttendance.Kinds;
        var rows = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => onlyCalendarEntryId == null || entry.Id == onlyCalendarEntryId)
            .Where(entry =>
                kinds.Contains(entry.Kind)
                && entry.StartsAt >= from
                && (
                    entry.OwnerGroupId == groupId
                    || entry.ParticipatingGroups.Any(participant => participant.GroupId == groupId)
                )
            )
            .OrderBy(entry => entry.StartsAt)
            .ThenBy(entry => entry.Id)
            .Select(entry => new TrainingRow(entry.Id, entry.Title, entry.StartsAt))
            .ToListAsync(ct);

        return [.. rows.Where(row => CastAttendance.SessionYearOf(row.StartsAt) == sessionYear)];
    }

    private async Task<IReadOnlyList<ResponseRow>> ResponsesAsync(
        IReadOnlyList<TrainingRow> trainings,
        IReadOnlyList<int> castIds,
        CancellationToken ct
    )
    {
        var entryIds = trainings.Select(training => training.Id).ToList();
        if (entryIds.Count == 0 || castIds.Count == 0)
            return [];

        return await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                entryIds.Contains(response.CalendarEntryId) && castIds.Contains(response.PersonId)
            )
            .OrderBy(response => response.PersonId)
            .Select(response => new ResponseRow(
                response.CalendarEntryId,
                response.PersonId,
                response.Answer,
                response.IsRecordedOnBehalf,
                response.RecordedBy == null
                    ? null
                    : response.RecordedBy.FirstName + " " + response.RecordedBy.LastName
            ))
            .ToListAsync(ct);
    }

    private async Task<ILookup<(int CalendarEntryId, int PersonId), ChangeRow>> TrailsAsync(
        IReadOnlyList<TrainingRow> trainings,
        IReadOnlyList<int> castIds,
        CancellationToken ct
    )
    {
        var entryIds = trainings.Select(training => training.Id).ToList();
        if (entryIds.Count == 0 || castIds.Count == 0)
            return Array.Empty<ChangeRow>().ToLookup(KeyOf);

        var rows = await _dbContext
            .AttendanceResponseChanges.AsNoTracking()
            .Where(change =>
                entryIds.Contains(change.CalendarEntryId) && castIds.Contains(change.PersonId)
            )
            .OrderByDescending(change => change.Id)
            .Select(change => new ChangeRow(
                change.CalendarEntryId,
                change.PersonId,
                change.Answer,
                change.IsRecordedOnBehalf,
                change.RecordedBy == null
                    ? null
                    : change.RecordedBy.FirstName + " " + change.RecordedBy.LastName,
                change.RecordedAt
            ))
            .ToListAsync(ct);

        return rows.ToLookup(KeyOf);
    }

    [Pure]
    private static (int, int) KeyOf(ChangeRow change) => (change.CalendarEntryId, change.PersonId);

    [Pure]
    private static IReadOnlyList<int> OpenSpotIdsOf(
        IReadOnlyList<StudioSpotDetails> spots,
        IEnumerable<ResponseRow> responses
    )
    {
        var declined = responses
            .Where(response => response.Answer == AttendanceAnswer.No)
            .Select(response => response.PersonId)
            .ToHashSet();

        return
        [
            .. spots
                .Where(spot => spot.Person is { } person && declined.Contains(person.PersonId))
                .Select(spot => spot.SpotId),
        ];
    }

    [Pure]
    private static StudioAttendanceDetails ToDetails(
        ResponseRow response,
        ILookup<(int CalendarEntryId, int PersonId), ChangeRow> trails
    ) =>
        new()
        {
            PersonId = response.PersonId,
            Answer = response.Answer,
            IsRecordedOnBehalf = response.IsRecordedOnBehalf,
            RecordedBy = response.RecordedBy,
            Trail =
            [
                .. trails[(response.CalendarEntryId, response.PersonId)]
                    .Select(change => new StudioAttendanceChangeDetails
                    {
                        Answer = change.Answer,
                        IsRecordedOnBehalf = change.IsRecordedOnBehalf,
                        RecordedBy = change.RecordedBy,
                        RecordedAt = change.RecordedAt,
                    }),
            ],
        };

    private sealed record TrainingRow(int Id, string Title, DateTimeOffset StartsAt);

    private sealed record ResponseRow(
        int CalendarEntryId,
        int PersonId,
        AttendanceAnswer Answer,
        bool IsRecordedOnBehalf,
        string? RecordedBy
    );

    private sealed record ChangeRow(
        int CalendarEntryId,
        int PersonId,
        AttendanceAnswer Answer,
        bool IsRecordedOnBehalf,
        string? RecordedBy,
        DateTimeOffset RecordedAt
    );
}
