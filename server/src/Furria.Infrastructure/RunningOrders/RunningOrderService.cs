using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class RunningOrderService
{
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string NoRunningOrderMessage = "Für diese Veranstaltung gibt es keinen Ablauf.";
    private const string UnknownActMessage = "Diesen Auftritt gibt es nicht.";
    private const string ArchivedActMessage =
        "Ein archivierter Auftritt lässt sich nicht neu einplanen.";
    private const string UnknownWishMessage =
        "Dieser Wunsch gehört zu keinem Auftritt in diesem Ablauf.";

    private static readonly IReadOnlyDictionary<RunningOrderShapeProblem, string> ShapeMessages =
        new Dictionary<RunningOrderShapeProblem, string>
        {
            [RunningOrderShapeProblem.DuplicateAct] = "Jeder Auftritt steht nur einmal im Ablauf.",
            [RunningOrderShapeProblem.PositionsNotDense] =
                "Die Reihenfolge hat Lücken oder doppelte Plätze.",
            [RunningOrderShapeProblem.PinnedLineUnplaced] =
                "Eine festgesetzte Zeile braucht einen Platz im Ablauf.",
            [RunningOrderShapeProblem.BlockMemberUnplaced] =
                "Jeder Auftritt eines Blocks braucht einen Platz im Ablauf.",
            [RunningOrderShapeProblem.BlockNotContiguous] =
                "Die Auftritte eines Blocks stehen direkt hintereinander.",
            [RunningOrderShapeProblem.RuleShapeInvalid] = "Diese Regel ist unvollständig.",
            [RunningOrderShapeProblem.RuleSubjectMissing] =
                "Eine Regel nennt einen Auftritt, der nicht im Ablauf steht.",
        };

    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly TimeProvider _timeProvider;

    public RunningOrderService(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<RunningOrderSummary>> GetRunningOrdersAsync(
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .RunningOrders.AsNoTracking()
            .OrderByDescending(order => order.CalendarEntry!.StartsAt)
            .ThenBy(order => order.CalendarEntryId)
            .Select(order => new
            {
                order.CalendarEntryId,
                order.CalendarEntry!.Title,
                order.CalendarEntry.StartsAt,
                Lines = order
                    .Lines.Select(line => new
                    {
                        line.ActId,
                        line.Position,
                        line.Id,
                    })
                    .ToList(),
            })
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => new RunningOrderSummary
            {
                EventId = row.CalendarEntryId,
                Title = row.Title,
                StartsAt = row.StartsAt,
                ActIds =
                [
                    .. row
                        .Lines.OrderBy(line => line.Position is null)
                        .ThenBy(line => line.Position)
                        .ThenBy(line => line.Id)
                        .Select(line => line.ActId),
                ],
            }),
        ];
    }

    public async Task<RunningOrderDetails?> GetRunningOrderAsync(int eventId, CancellationToken ct)
    {
        var order = await LoadAsync(eventId, ct, tracked: false);
        if (order is null)
            return null;

        return await DetailsOfAsync(order, ct);
    }

    public async Task<IReadOnlySet<int>> SettledEventIdsAsync(
        IReadOnlyCollection<int> eventIds,
        CancellationToken ct
    )
    {
        var candidates = await _dbContext
            .RunningOrders.AsNoTracking()
            .Where(order =>
                eventIds.Contains(order.CalendarEntryId)
                && order.ConfirmedAt != null
                && !order.ChangedSinceConfirmed
                && order.Lines.Any()
                && order.Lines.All(line => line.Position != null)
            )
            .Include(order => order.Lines)
            .Include(order => order.Rules)
            .Include(order => order.SuspendedWishes)
            .AsSplitQuery()
            .ToListAsync(ct);
        var settled = new HashSet<int>();
        foreach (var order in candidates)
            if (!HasConflicts(await FindingsOfAsync(order, ct)))
                settled.Add(order.CalendarEntryId);

        return settled;
    }

    public async Task<Result<RunningOrderDetails>> SaveAsync(
        SaveRunningOrderCommand command,
        CancellationToken ct
    )
    {
        if (!await IsEventAsync(command.EventId, ct))
            return Result<RunningOrderDetails>.NotFound(UnknownEventMessage);

        var order = await LoadAsync(command.EventId, ct, tracked: true);
        if (order?.Version != command.Version)
            return Result<RunningOrderDetails>.Conflict(WriteConflictMessages.ChangedMeanwhile);

        var refusal = await RefusalOfAsync(command.State, order, ct);
        if (refusal is { } refused)
            return Result<RunningOrderDetails>.Validation(refused);

        order ??= Created(command.EventId);
        Apply(order, command.State);
        await _dbContext.SaveChangesAsync(ct);

        return Result<RunningOrderDetails>.Success(await DetailsOfAsync(order, ct));
    }

    public async Task<Result<RunningOrderDetails>> ConfirmAsync(
        int eventId,
        bool confirmed,
        CancellationToken ct
    )
    {
        var order = await LoadAsync(eventId, ct, tracked: true);
        if (order is null)
            return Result<RunningOrderDetails>.NotFound(NoRunningOrderMessage);

        order.ConfirmedAt = confirmed ? _timeProvider.GetUtcNow() : null;
        order.ChangedSinceConfirmed = false;
        await _dbContext.SaveChangesAsync(ct);

        return Result<RunningOrderDetails>.Success(await DetailsOfAsync(order, ct));
    }

    public async Task<Result> DeleteAsync(int eventId, CancellationToken ct)
    {
        var deleted = await _dbContext
            .RunningOrders.Where(order => order.CalendarEntryId == eventId)
            .ExecuteDeleteAsync(ct);

        return deleted == 0 ? Result.NotFound(NoRunningOrderMessage) : Result.Success();
    }

    public async Task<Result<RunningOrderProposal>> SuggestAsync(
        SuggestRunningOrderCommand command,
        CancellationToken ct
    )
    {
        if (!await IsEventAsync(command.EventId, ct))
            return Result<RunningOrderProposal>.NotFound(UnknownEventMessage);

        var order = await LoadAsync(command.EventId, ct, tracked: false);
        var refusal = await RefusalOfAsync(command.State, order, ct);
        if (refusal is { } refused)
            return Result<RunningOrderProposal>.Validation(refused);

        var lines = command
            .State.Lines.Select(draft => new RunningOrderLine
            {
                ActId = draft.ActId,
                Position = draft.Position,
                IsPinned = draft.IsPinned,
                BlockKey = draft.BlockKey,
            })
            .ToList();
        var rules = command
            .State.Rules.Select(draft => new RunningOrderRule
            {
                Kind = draft.Kind,
                Strength = draft.Strength,
                ActId = draft.ActId,
                OtherActId = draft.OtherActId,
                ActKind = draft.ActKind,
            })
            .ToList();
        var evening = await EveningOfAsync(command.EventId, lines, ct);
        var input = ReviewInputOf(
            evening,
            lines,
            rules,
            command.State.SuspendedActWishIds.ToHashSet()
        );

        return Result<RunningOrderProposal>.Success(RunningOrderSuggestion.ProposalFor(input));
    }

    private Task<bool> IsEventAsync(int eventId, CancellationToken ct) =>
        _dbContext.Events.AnyAsync(row => row.CalendarEntryId == eventId, ct);

    private Task<RunningOrder?> LoadAsync(int eventId, CancellationToken ct, bool tracked)
    {
        var orders = tracked ? _dbContext.RunningOrders : _dbContext.RunningOrders.AsNoTracking();

        return orders
            .Include(order => order.Lines)
            .Include(order => order.Rules)
            .Include(order => order.SuspendedWishes)
            .AsSplitQuery()
            .SingleOrDefaultAsync(order => order.CalendarEntryId == eventId, ct);
    }

    private async Task<string?> RefusalOfAsync(
        RunningOrderStateCommand state,
        RunningOrder? existing,
        CancellationToken ct
    )
    {
        if (RunningOrderShape.ProblemOf(state.Lines, state.Rules) is { } problem)
            return ShapeMessages[problem];

        var actIds = state.Lines.Select(line => line.ActId).ToHashSet();
        var acts = await _dbContext
            .Acts.AsNoTracking()
            .Where(act => actIds.Contains(act.Id))
            .Select(act => new { act.Id, IsArchived = act.ArchivedAt != null })
            .ToListAsync(ct);
        if (acts.Count != actIds.Count)
            return UnknownActMessage;

        var plannedBefore = existing?.Lines.Select(line => line.ActId).ToHashSet() ?? [];
        if (acts.Any(act => act.IsArchived && !plannedBefore.Contains(act.Id)))
            return ArchivedActMessage;

        var suspendedIds = state.SuspendedActWishIds.ToHashSet();
        var knownWishes = await _dbContext.ActWishes.CountAsync(
            wish => suspendedIds.Contains(wish.Id) && actIds.Contains(wish.ActId),
            ct
        );

        return knownWishes == suspendedIds.Count ? null : UnknownWishMessage;
    }

    private RunningOrder Created(int eventId)
    {
        var order = new RunningOrder { CalendarEntryId = eventId };
        _dbContext.RunningOrders.Add(order);

        return order;
    }

    private static void Apply(RunningOrder order, RunningOrderStateCommand state)
    {
        order.Version++;
        order.ChangedSinceConfirmed = order.ConfirmedAt is not null;
        SyncLines(order, state.Lines);
        order.Rules.Clear();
        foreach (var draft in state.Rules)
            order.Rules.Add(
                new RunningOrderRule
                {
                    Kind = draft.Kind,
                    Strength = draft.Strength,
                    ActId = draft.ActId,
                    OtherActId = draft.OtherActId,
                    ActKind = draft.ActKind,
                }
            );
        SyncSuspendedWishes(order, state.SuspendedActWishIds.ToHashSet());
    }

    private static void SyncSuspendedWishes(RunningOrder order, IReadOnlySet<int> actWishIds)
    {
        foreach (
            var stale in order
                .SuspendedWishes.Where(wish => !actWishIds.Contains(wish.ActWishId))
                .ToList()
        )
            order.SuspendedWishes.Remove(stale);

        var kept = order.SuspendedWishes.Select(wish => wish.ActWishId).ToHashSet();
        foreach (var actWishId in actWishIds.Where(id => !kept.Contains(id)))
            order.SuspendedWishes.Add(new RunningOrderSuspendedWish { ActWishId = actWishId });
    }

    private static void SyncLines(RunningOrder order, IReadOnlyList<RunningOrderLineDraft> drafts)
    {
        var wanted = drafts.Select(draft => draft.ActId).ToHashSet();
        foreach (var stale in order.Lines.Where(line => !wanted.Contains(line.ActId)).ToList())
            order.Lines.Remove(stale);

        foreach (var draft in drafts)
        {
            var line = order.Lines.SingleOrDefault(existing => existing.ActId == draft.ActId);
            if (line is null)
            {
                line = new RunningOrderLine { ActId = draft.ActId };
                order.Lines.Add(line);
            }

            line.Position = draft.Position;
            line.IsPinned = draft.IsPinned;
            line.BlockKey = draft.BlockKey;
        }
    }

    private async Task<IReadOnlyList<RunningOrderFinding>> FindingsOfAsync(
        RunningOrder order,
        CancellationToken ct
    )
    {
        var lines = LinesInOrderOf(order);
        var evening = await EveningOfAsync(order.CalendarEntryId, lines, ct);

        return RunningOrderReview.FindingsOf(
            ReviewInputOf(evening, lines, [.. order.Rules], SuspendedOf(order))
        );
    }

    private async Task<RunningOrderDetails> DetailsOfAsync(RunningOrder order, CancellationToken ct)
    {
        var lines = LinesInOrderOf(order);
        var evening = await EveningOfAsync(order.CalendarEntryId, lines, ct);
        var suspended = SuspendedOf(order);
        var input = ReviewInputOf(evening, lines, [.. order.Rules], suspended);
        var lineIds = lines.ToDictionary(KeyOf, line => line.Id);

        return new RunningOrderDetails
        {
            EventId = order.CalendarEntryId,
            Version = order.Version,
            ConfirmedAt = order.ConfirmedAt,
            ChangedSinceConfirmed = order.ChangedSinceConfirmed,
            Lines = [.. lines.Select(line => LineDetailsOf(line, evening))],
            Rules = [.. order.Rules.OrderBy(rule => rule.Id).Select(RuleDetailsOf)],
            ActWishes =
            [
                .. evening
                    .Acts.Values.SelectMany(act => act.Wishes)
                    .OrderBy(wish => wish.ActWishId)
                    .Select(wish => new RunningOrderActWishDetails
                    {
                        Wish = wish,
                        IsSuspended = suspended.Contains(wish.ActWishId),
                    }),
            ],
            Findings =
            [
                .. RunningOrderReview
                    .FindingsOf(input)
                    .Select(finding => FindingDetailsOf(finding, lineIds)),
            ],
        };
    }

    private async Task<EveningCast> EveningOfAsync(
        int eventId,
        IReadOnlyList<RunningOrderLine> lines,
        CancellationToken ct
    )
    {
        var startsAt = await _dbContext
            .CalendarEntries.Where(entry => entry.Id == eventId)
            .Select(entry => entry.StartsAt)
            .SingleAsync(ct);
        var absent = await _dbContext
            .AttendanceResponses.Where(response =>
                response.CalendarEntryId == eventId && response.Answer == AttendanceAnswer.No
            )
            .Select(response => response.PersonId)
            .ToListAsync(ct);
        var actIds = lines.Select(line => line.ActId).ToHashSet();
        var acts = await _catalogue.ActsOnAsync(
            act => actIds.Contains(act.Id),
            ClubClock.DayOf(startsAt),
            ct
        );

        return new EveningCast(
            acts.ToDictionary(act => act.ActId, act => WithAbsences(act, absent.ToHashSet()))
        );
    }

    [Pure]
    private static IReadOnlyList<RunningOrderLine> LinesInOrderOf(RunningOrder order) =>
        [
            .. order
                .Lines.OrderBy(line => line.Position is null)
                .ThenBy(line => line.Position)
                .ThenBy(line => line.Id),
        ];

    [Pure]
    private static IReadOnlySet<int> SuspendedOf(RunningOrder order) =>
        order.SuspendedWishes.Select(wish => wish.ActWishId).ToHashSet();

    [Pure]
    private static bool HasConflicts(IEnumerable<RunningOrderFinding> findings) =>
        findings.Any(finding => finding.Severity == FindingSeverity.Conflict);

    [Pure]
    private static ActSummary WithAbsences(ActSummary act, IReadOnlySet<int> absent) =>
        act with
        {
            Cast =
            [
                .. act.Cast.Select(member =>
                    member with
                    {
                        IsAbsent = absent.Contains(member.PersonId),
                    }
                ),
            ],
        };

    [Pure]
    private static RunningOrderReviewInput ReviewInputOf(
        EveningCast evening,
        IReadOnlyList<RunningOrderLine> lines,
        IReadOnlyList<RunningOrderRule> rules,
        IReadOnlySet<int> suspended
    ) =>
        new()
        {
            Lines = [.. lines.Select(line => ReviewLineOf(line, evening))],
            Rules =
            [
                .. rules.Select(rule => new ReviewRule
                {
                    Kind = rule.Kind,
                    Strength = rule.Strength,
                    ActId = rule.ActId,
                    OtherActId = rule.OtherActId,
                    ActKind = rule.ActKind,
                    RuleId = rule.Id == 0 ? null : rule.Id,
                    ActWishId = null,
                }),
                .. evening
                    .Acts.Values.SelectMany(act => act.Wishes)
                    .Where(wish => !suspended.Contains(wish.ActWishId))
                    .Select(wish => new ReviewRule
                    {
                        Kind = wish.Kind,
                        Strength = wish.Strength,
                        ActId = wish.ActId,
                        OtherActId = null,
                        ActKind = null,
                        RuleId = null,
                        ActWishId = wish.ActWishId,
                    }),
            ],
        };

    [Pure]
    private static ReviewLine ReviewLineOf(RunningOrderLine line, EveningCast evening)
    {
        var act = evening.Acts[line.ActId];

        return new ReviewLine
        {
            Key = KeyOf(line),
            ActKind = act.Kind,
            HasGroup = act.Group is not null,
            Position = line.Position,
            IsPinned = line.IsPinned,
            BlockKey = line.BlockKey,
            Cast =
            [
                .. act.Cast.Select(member => new ReviewCastMember(
                    member.PersonId,
                    member.IsAbsent
                )),
            ],
        };
    }

    [Pure]
    private static LineKey KeyOf(RunningOrderLine line) => LineKey.OfAct(line.ActId);

    [Pure]
    private static RunningOrderLineDetails LineDetailsOf(
        RunningOrderLine line,
        EveningCast evening
    ) =>
        new()
        {
            LineId = line.Id,
            Act = ActDetailsOf(evening.Acts[line.ActId]),
            Position = line.Position,
            IsPinned = line.IsPinned,
            BlockKey = line.BlockKey,
        };

    [Pure]
    private static RunningOrderActDetails ActDetailsOf(ActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            Group = act.Group,
            Cast = act.Cast,
        };

    [Pure]
    private static RunningOrderRuleDetails RuleDetailsOf(RunningOrderRule rule) =>
        new()
        {
            RuleId = rule.Id,
            Kind = rule.Kind,
            Strength = rule.Strength,
            ActId = rule.ActId,
            OtherActId = rule.OtherActId,
            ActKind = rule.ActKind,
        };

    [Pure]
    private static RunningOrderFindingDetails FindingDetailsOf(
        RunningOrderFinding finding,
        IReadOnlyDictionary<LineKey, int> lineIds
    ) =>
        new()
        {
            Kind = finding.Kind,
            Severity = finding.Severity,
            LineIds = [.. finding.Lines.Select(key => lineIds[key])],
            PersonIds = finding.PersonIds,
            RuleId = finding.RuleId,
            ActWishId = finding.ActWishId,
        };

    private sealed record EveningCast(IReadOnlyDictionary<int, ActSummary> Acts);
}
