using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Groups;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Groups;

public sealed class TrainingService
{
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht mehr im Verzeichnis.";
    private const string ArchivedGroupMessage =
        "Eine archivierte Gruppe kann nicht bearbeitet werden.";
    private const string EndsInThePastMessage = "Das Enddatum liegt schon hinter uns.";
    private const string HorizonMessage = "So weit im Voraus plant die App keine Trainings.";
    private const string UnknownSlotMessage =
        "Diese Trainingszeit gehört nicht zum Rhythmus dieser Gruppe.";
    private const string OffRhythmMessage =
        "Dieser Termin passt nicht zur gewählten Trainingszeit. Lade die Vorschau neu.";
    private const string PastInstantMessage = "Trainings entstehen erst ab heute.";
    private const string NothingTickedMessage = "Es ist kein Termin angehakt.";

    private readonly AppDbContext _dbContext;
    private readonly CalendarService _calendarService;
    private readonly TimeProvider _timeProvider;

    public TrainingService(
        AppDbContext dbContext,
        CalendarService calendarService,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _calendarService = calendarService;
        _timeProvider = timeProvider;
    }

    public async Task<Result<TrainingPreview>> PreviewAsync(
        TrainingPreviewQuery query,
        CancellationToken ct
    )
    {
        var group = await GroupStateAsync(query.GroupId, ct);

        if (group is null)
            return Result<TrainingPreview>.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result<TrainingPreview>.Conflict(ArchivedGroupMessage);

        var today = ClubClock.Today(_timeProvider);
        var defaultEndsOn = DefaultEndOf(today);
        var endsOn = query.EndsOn ?? defaultEndsOn;

        if (endsOn < today)
            return Result<TrainingPreview>.Validation(EndsInThePastMessage);

        if (endsOn > today.AddDays(TrainingGenerator.MaxHorizonDays))
            return Result<TrainingPreview>.Validation(HorizonMessage);

        var slots = await SlotsOfAsync(query.GroupId, ct);
        var candidates = TrainingGenerator.Expand(slots, today, endsOn);
        var venueNames = VenueNamesOf(slots);
        var archivedVenueIds = ArchivedVenueIdsOf(slots);
        var taken = await TakenAsync(query.GroupId, today, endsOn, ct);
        var collisions = await CollisionsOfAsync(candidates, query.ViewerPersonId, ct);

        return Result<TrainingPreview>.Success(
            new TrainingPreview
            {
                DefaultEndsOn = defaultEndsOn,
                EndsOn = endsOn,
                Rows =
                [
                    .. candidates.Select(candidate =>
                        ToRow(
                            candidate,
                            new VenueFacts(venueNames, archivedVenueIds),
                            taken,
                            FoundFor(candidate, query.ViewerPersonId, collisions)
                        )
                    ),
                ],
            }
        );
    }

    public async Task<Result<TrainingGenerationResult>> GenerateAsync(
        GenerateTrainingsCommand command,
        CancellationToken ct
    )
    {
        var group = await GroupStateAsync(command.GroupId, ct);

        if (group is null)
            return Result<TrainingGenerationResult>.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result<TrainingGenerationResult>.Conflict(ArchivedGroupMessage);

        var slots = await SlotsOfAsync(command.GroupId, ct);
        var planned = Planned(command.Instants, slots, ClubClock.Today(_timeProvider));

        if (!planned.IsSuccess)
            return Result<TrainingGenerationResult>.Validation(planned.Error.Message);

        var taken = await TakenAsync(
            command.GroupId,
            ClubClock.DayOf(planned.Value.Min(candidate => candidate.StartsAt)),
            ClubClock.DayOf(planned.Value.Max(candidate => candidate.StartsAt)),
            ct
        );

        var wanted = Unheld(planned.Value, taken);
        var collisions = await CollisionsOfAsync(wanted, command.ViewerPersonId, ct);
        var skippedCount = planned.Value.Count - wanted.Count;

        if (wanted.Count == 0)
        {
            return Result<TrainingGenerationResult>.Success(
                new TrainingGenerationResult
                {
                    CreatedCount = 0,
                    SkippedCount = skippedCount,
                    VenueCollisions = [],
                }
            );
        }

        var written = await _calendarService.CreateManyAsync(
            new CreateTrainingsCommand
            {
                OwnerGroupId = command.GroupId,
                Title = command.Title,
                Placements = [.. wanted.Select(ToPlacement)],
            },
            ct
        );

        if (!written.IsSuccess)
            return Result<TrainingGenerationResult>.Validation(written.Error.Message);

        return Result<TrainingGenerationResult>.Success(
            new TrainingGenerationResult
            {
                CreatedCount = written.Value,
                SkippedCount = skippedCount,
                VenueCollisions = Gathered(collisions),
            }
        );
    }

    private Task<
        IReadOnlyDictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>>
    > CollisionsOfAsync(
        IReadOnlyList<TrainingCandidate> candidates,
        int viewerPersonId,
        CancellationToken ct
    ) =>
        _calendarService.FindVenueCollisionsAsync(
            [
                .. candidates
                    .Where(candidate => candidate.VenueId is not null)
                    .Select(candidate => ToProbe(candidate, viewerPersonId)),
            ],
            ct
        );

    private Task<GroupStateRow?> GroupStateAsync(int groupId, CancellationToken ct) =>
        _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId)
            .Select(group => new GroupStateRow(group.Id, group.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private async Task<IReadOnlyList<GroupTrainingSlot>> SlotsOfAsync(
        int groupId,
        CancellationToken ct
    ) =>
        await _dbContext
            .GroupTrainingSlots.AsNoTracking()
            .Include(slot => slot.Venue)
            .Where(slot => slot.GroupId == groupId)
            .OrderBy(slot => slot.Weekday)
            .ThenBy(slot => slot.StartsAt)
            .ThenBy(slot => slot.Id)
            .ToListAsync(ct);

    private async Task<IReadOnlySet<DateTimeOffset>> TakenAsync(
        int groupId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct
    )
    {
        var held = await _calendarService.FindExistingTrainingsAsync(groupId, from, to, ct);

        return held.ToHashSet();
    }

    [Pure]
    private static Result<IReadOnlyList<TrainingCandidate>> Planned(
        IReadOnlyList<TrainingInstant> instants,
        IReadOnlyList<GroupTrainingSlot> slots,
        DateOnly today
    )
    {
        var planned = new List<TrainingCandidate>();

        foreach (var instant in instants.DistinctBy(ToInstantKey))
        {
            var slot = slots.SingleOrDefault(row => row.Id == instant.GroupTrainingSlotId);

            if (slot is null)
                return Result<IReadOnlyList<TrainingCandidate>>.Validation(UnknownSlotMessage);

            var day = ClubClock.DayOf(instant.StartsAt);

            if (day < today)
                return Result<IReadOnlyList<TrainingCandidate>>.Validation(PastInstantMessage);

            var candidate = TrainingGenerator.Expand([slot], day, day).SingleOrDefault();

            if (candidate is null || candidate.StartsAt != instant.StartsAt)
                return Result<IReadOnlyList<TrainingCandidate>>.Validation(OffRhythmMessage);

            planned.Add(candidate);
        }

        if (planned.Count == 0)
            return Result<IReadOnlyList<TrainingCandidate>>.Validation(NothingTickedMessage);

        return Result<IReadOnlyList<TrainingCandidate>>.Success(planned);
    }

    [Pure]
    private static IReadOnlyList<TrainingCandidate> Unheld(
        IReadOnlyList<TrainingCandidate> planned,
        IReadOnlySet<DateTimeOffset> taken
    ) => [.. planned.Where(candidate => !taken.Contains(candidate.StartsAt))];

    [Pure]
    private static DateOnly DefaultEndOf(DateOnly today) =>
        ClubSession.ClosingOf(ClubSession.RelevantYearOf(today));

    [Pure]
    private static IReadOnlySet<int> ArchivedVenueIdsOf(IReadOnlyList<GroupTrainingSlot> slots) =>
        slots
            .Where(slot => slot.Venue is { ArchivedOn: not null })
            .Select(slot => slot.VenueId ?? 0)
            .ToHashSet();

    [Pure]
    private static IReadOnlyDictionary<int, string> VenueNamesOf(
        IReadOnlyList<GroupTrainingSlot> slots
    ) =>
        slots
            .Where(slot => slot.Venue is not null)
            .DistinctBy(slot => slot.VenueId)
            .ToDictionary(slot => slot.VenueId ?? 0, slot => slot.Venue?.Name ?? "");

    [Pure]
    private static VenueCollisionQuery ToProbe(TrainingCandidate candidate, int viewerPersonId) =>
        new()
        {
            ViewerPersonId = viewerPersonId,
            VenueId = candidate.VenueId ?? 0,
            StartsAt = candidate.StartsAt,
            EndsAt = candidate.EndsAt,
            ExcludeCalendarEntryId = null,
        };

    [Pure]
    private static IReadOnlyList<CalendarEntrySummary> FoundFor(
        TrainingCandidate candidate,
        int viewerPersonId,
        IReadOnlyDictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>> found
    )
    {
        if (candidate.VenueId is null)
            return [];

        return found.TryGetValue(ToProbe(candidate, viewerPersonId), out var collisions)
            ? collisions
            : [];
    }

    [Pure]
    private static IReadOnlyList<CalendarEntrySummary> Gathered(
        IReadOnlyDictionary<VenueCollisionQuery, IReadOnlyList<CalendarEntrySummary>> found
    ) =>
        [
            .. found
                .Values.SelectMany(collisions => collisions)
                .DistinctBy(entry => entry.CalendarEntryId)
                .OrderBy(entry => entry.StartsAt)
                .ThenBy(entry => entry.CalendarEntryId),
        ];

    [Pure]
    private static TrainingPreviewRow ToRow(
        TrainingCandidate candidate,
        VenueFacts venues,
        IReadOnlySet<DateTimeOffset> taken,
        IReadOnlyList<CalendarEntrySummary> collisions
    ) =>
        new()
        {
            GroupTrainingSlotId = candidate.GroupTrainingSlotId,
            StartsAt = candidate.StartsAt,
            EndsAt = candidate.EndsAt,
            VenueId = candidate.VenueId,
            VenueName = NameOf(candidate.VenueId, venues.Names),
            State = StateOf(candidate, venues.ArchivedIds, taken, collisions),
            VenueCollisions = collisions,
        };

    [Pure]
    private static string? NameOf(int? venueId, IReadOnlyDictionary<int, string> venueNames) =>
        venueId is { } id && venueNames.TryGetValue(id, out var name) ? name : null;

    [Pure]
    private static TrainingPreviewState StateOf(
        TrainingCandidate candidate,
        IReadOnlySet<int> archivedVenueIds,
        IReadOnlySet<DateTimeOffset> taken,
        IReadOnlyList<CalendarEntrySummary> collisions
    )
    {
        if (taken.Contains(candidate.StartsAt))
            return TrainingPreviewState.AlreadyExists;

        if (candidate.VenueId is { } venueId && archivedVenueIds.Contains(venueId))
            return TrainingPreviewState.VenueArchived;

        return collisions.Count == 0
            ? TrainingPreviewState.Creatable
            : TrainingPreviewState.VenueTaken;
    }

    [Pure]
    private static TrainingPlacement ToPlacement(TrainingCandidate candidate) =>
        new()
        {
            StartsAt = candidate.StartsAt,
            EndsAt = candidate.EndsAt,
            VenueId = candidate.VenueId,
        };

    [Pure]
    private static (int SlotId, DateTimeOffset StartsAt) ToInstantKey(TrainingInstant instant) =>
        (instant.GroupTrainingSlotId, instant.StartsAt);

    private sealed record GroupStateRow(int GroupId, DateOnly? ArchivedOn);

    private sealed record VenueFacts(
        IReadOnlyDictionary<int, string> Names,
        IReadOnlySet<int> ArchivedIds
    );
}
