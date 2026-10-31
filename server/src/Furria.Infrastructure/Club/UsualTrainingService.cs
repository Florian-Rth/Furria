using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class UsualTrainingService
{
    private const string NoPersonMessage = "Dieser Zugang gehört zu keiner Person.";

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public UsualTrainingService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<Result<IReadOnlyList<UsualTrainingSummary>>> GetUsualTrainingsAsync(
        CalendarWindowQuery query,
        CancellationToken ct
    )
    {
        if (await _authorizer.ActivePersonIdAsync(query.ViewerAccountId, ct) is null)
            return Result<IReadOnlyList<UsualTrainingSummary>>.Forbidden(NoPersonMessage);

        var today = ClubClock.Today(_timeProvider);
        var from = query.From < today ? today : query.From;

        if (from > query.To)
            return Result<IReadOnlyList<UsualTrainingSummary>>.Success([]);

        var usualTimes = await RunningGroupUsualTimesAsync(query.OwnerGroupId, ct);

        if (usualTimes.Count == 0)
            return Result<IReadOnlyList<UsualTrainingSummary>>.Success([]);

        var plannedDays = await PlannedTrainingDaysAsync(
            [.. usualTimes.Select(usualTime => usualTime.GroupId).Distinct()],
            from,
            query.To,
            ct
        );
        var usualTimesById = usualTimes.ToDictionary(usualTime => usualTime.Id);

        return Result<IReadOnlyList<UsualTrainingSummary>>.Success([
            .. UsualTrainingOccurrences
                .Between(usualTimes, from, query.To)
                .Where(occurrence => !plannedDays.Contains(DayKeyOf(occurrence)))
                .Select(occurrence =>
                    ToSummary(occurrence, usualTimesById[occurrence.UsualTrainingTimeId])
                ),
        ]);
    }

    private async Task<IReadOnlyList<UsualTrainingTime>> RunningGroupUsualTimesAsync(
        int? ownerGroupId,
        CancellationToken ct
    ) =>
        await _dbContext
            .UsualTrainingTimes.AsNoTracking()
            .Include(usualTime => usualTime.Group)
            .Include(usualTime => usualTime.Venue)
            .Where(usualTime => usualTime.Group != null && usualTime.Group.ArchivedOn == null)
            .Where(usualTime => ownerGroupId == null || usualTime.GroupId == ownerGroupId)
            .OrderBy(usualTime => usualTime.Id)
            .ToListAsync(ct);

    private async Task<IReadOnlySet<PlannedDay>> PlannedTrainingDaysAsync(
        IReadOnlyList<int> groupIds,
        DateOnly from,
        DateOnly to,
        CancellationToken ct
    )
    {
        var windowStart = ClubClock.StartOfDay(from);
        var windowEnd = ClubClock.StartOfDay(to.AddDays(1));

        var planned = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry =>
                entry.Kind == CalendarEntryKind.Training
                && entry.OwnerGroupId != null
                && groupIds.Contains(entry.OwnerGroupId.Value)
                && entry.StartsAt >= windowStart
                && entry.StartsAt < windowEnd
            )
            .Select(entry => new { GroupId = entry.OwnerGroupId!.Value, entry.StartsAt })
            .ToListAsync(ct);

        return planned
            .Select(entry => new PlannedDay(entry.GroupId, ClubClock.DayOf(entry.StartsAt)))
            .ToHashSet();
    }

    [Pure]
    private static PlannedDay DayKeyOf(UsualTrainingOccurrence occurrence) =>
        new(occurrence.GroupId, ClubClock.DayOf(occurrence.StartsAt));

    [Pure]
    private static UsualTrainingSummary ToSummary(
        UsualTrainingOccurrence occurrence,
        UsualTrainingTime usualTime
    ) =>
        new()
        {
            UsualTrainingTimeId = occurrence.UsualTrainingTimeId,
            GroupId = occurrence.GroupId,
            GroupName = usualTime.Group?.Name ?? "",
            GroupTone = usualTime.Group?.Tone,
            StartsAt = occurrence.StartsAt,
            EndsAt = occurrence.EndsAt,
            VenueId = occurrence.VenueId,
            VenueName = usualTime.Venue?.Name,
        };

    private readonly record struct PlannedDay(int GroupId, DateOnly Day);
}
