using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Club;
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

    private static readonly IReadOnlyDictionary<
        AppearanceSessionProblem,
        string
    > AppearanceSessionMessages = new Dictionary<AppearanceSessionProblem, string>
    {
        [AppearanceSessionProblem.SessionEnded] =
            "Die Session dieses Auftritts ist vorbei, er lässt sich nicht mehr einplanen.",
        [AppearanceSessionProblem.OtherSession] =
            "Dieser Auftritt gehört zu einer anderen Session als die Veranstaltung.",
    };

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
            })
            .ToListAsync(ct);
        var eventIds = rows.Select(row => row.CalendarEntryId).ToList();
        var appearances = await _dbContext
            .Appearances.AsNoTracking()
            .Where(appearance => eventIds.Contains(appearance.CalendarEntryId))
            .OrderBy(appearance => appearance.Position == null)
            .ThenBy(appearance => appearance.Position)
            .ThenBy(appearance => appearance.Id)
            .Select(appearance => new { appearance.CalendarEntryId, appearance.ActId })
            .ToListAsync(ct);
        var actIdsByEvent = appearances.ToLookup(
            appearance => appearance.CalendarEntryId,
            appearance => appearance.ActId
        );

        return
        [
            .. rows.Select(row => new RunningOrderSummary
            {
                EventId = row.CalendarEntryId,
                Title = row.Title,
                StartsAt = row.StartsAt,
                ActIds = [.. actIdsByEvent[row.CalendarEntryId]],
            }),
        ];
    }

    public async Task<RunningOrderDetails?> GetRunningOrderAsync(int eventId, CancellationToken ct)
    {
        var order = await LoadAsync(eventId, ct, tracked: false);
        if (order is null)
            return null;

        return await DetailsOfAsync(
            order,
            await AppearancesOfAsync(eventId, ct, tracked: false),
            ct
        );
    }

    public async Task<EveningRunningOrderDetails> GetEveningRunningOrderAsync(
        int eventId,
        int viewerPersonId,
        CancellationToken ct
    )
    {
        var order = await _dbContext
            .RunningOrders.AsNoTracking()
            .Where(row => row.CalendarEntryId == eventId)
            .Select(row => new { row.ConfirmedAt, row.ChangedSinceConfirmed })
            .SingleOrDefaultAsync(ct);
        var placed = order is null
            ? []
            : InOrder(await AppearancesOfAsync(eventId, ct, tracked: false))
                .Where(line => line.Position is not null)
                .ToList();
        var acts = await ActsOnEveningAsync(eventId, placed, ct);
        var viewerGroupIds = await _dbContext
            .TiedGroupIds(viewerPersonId, ClubClock.Today(_timeProvider))
            .ToHashSetAsync(ct);

        return new EveningRunningOrderDetails
        {
            EventId = eventId,
            IsConfirmed = order is { ConfirmedAt: not null, ChangedSinceConfirmed: false },
            Lines =
            [
                .. placed.Select(
                    (line, index) =>
                        EveningLineOf(
                            acts[line.ActId],
                            index,
                            IsOwn(acts[line.ActId], viewerPersonId, viewerGroupIds)
                        )
                ),
            ],
        };
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
                && _dbContext.Appearances.Any(appearance =>
                    appearance.CalendarEntryId == order.CalendarEntryId
                )
                && _dbContext.Appearances.All(appearance =>
                    appearance.CalendarEntryId != order.CalendarEntryId
                    || appearance.Position != null
                )
            )
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

        var appearances = await AppearancesOfAsync(command.EventId, ct, tracked: true);
        var refusal = await RefusalOfAsync(command.EventId, command.State, appearances, ct);
        if (refusal is { } refused)
            return Result<RunningOrderDetails>.Validation(refused);

        order ??= Created(command.EventId);
        Apply(order, command.State);
        var kept = SyncAppearances(command.EventId, appearances, command.State.Lines);
        await _dbContext.SaveChangesAsync(ct);

        return Result<RunningOrderDetails>.Success(await DetailsOfAsync(order, kept, ct));
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

        return Result<RunningOrderDetails>.Success(
            await DetailsOfAsync(order, await AppearancesOfAsync(eventId, ct, tracked: false), ct)
        );
    }

    public async Task<Result> DeleteAsync(int eventId, CancellationToken ct)
    {
        var order = await _dbContext.RunningOrders.SingleOrDefaultAsync(
            row => row.CalendarEntryId == eventId,
            ct
        );
        if (order is null)
            return Result.NotFound(NoRunningOrderMessage);

        _dbContext.Appearances.RemoveRange(await AppearancesOfAsync(eventId, ct, tracked: true));
        _dbContext.RunningOrders.Remove(order);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<RunningOrderProposal>> SuggestAsync(
        SuggestRunningOrderCommand command,
        Action<RunningOrderProposal> improved,
        CancellationToken ct
    )
    {
        if (!await IsEventAsync(command.EventId, ct))
            return Result<RunningOrderProposal>.NotFound(UnknownEventMessage);

        var appearances = await AppearancesOfAsync(command.EventId, ct, tracked: false);
        var refusal = await RefusalOfAsync(command.EventId, command.State, appearances, ct);
        if (refusal is { } refused)
            return Result<RunningOrderProposal>.Validation(refused);

        var lines = command
            .State.Lines.Select(draft => new Appearance
            {
                CalendarEntryId = command.EventId,
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
        var acts = await ActsOnEveningAsync(command.EventId, lines, ct);
        var input = ReviewInputOf(
            acts,
            lines,
            rules,
            command.State.SuspendedActWishIds.ToHashSet()
        );

        using var searchTime = new CancellationTokenSource(command.SearchTime, _timeProvider);
        using var stop = CancellationTokenSource.CreateLinkedTokenSource(searchTime.Token, ct);
        var search = new SuggestionSearch
        {
            Seed = [.. command.SeedActIds.Select(LineKey.OfAct)],
            Stop = stop.Token,
            Improved = improved,
        };

        return Result<RunningOrderProposal>.Success(
            RunningOrderSuggestion.ProposalFor(input, search)
        );
    }

    public async Task<Result> WithdrawFromUpcomingRunningOrdersAsync(
        int actId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Acts.AnyAsync(act => act.Id == actId, ct))
            return Result.NotFound(UnknownActMessage);

        var today = ClubClock.Today(_timeProvider);
        var evenings = await _dbContext
            .Appearances.Where(appearance => appearance.ActId == actId)
            .Select(appearance => new
            {
                appearance.CalendarEntryId,
                appearance.CalendarEntry!.StartsAt,
            })
            .ToListAsync(ct);
        var wishIds = await _dbContext
            .ActWishes.Where(wish => wish.ActId == actId)
            .Select(wish => wish.Id)
            .ToListAsync(ct);

        foreach (
            var evening in evenings.Where(evening => ClubClock.DayOf(evening.StartsAt) >= today)
        )
            await WithdrawAsync(evening.CalendarEntryId, actId, wishIds, ct);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task WithdrawAsync(
        int eventId,
        int actId,
        IReadOnlyList<int> wishIds,
        CancellationToken ct
    )
    {
        var appearances = await AppearancesOfAsync(eventId, ct, tracked: true);
        var leaving = appearances.Single(appearance => appearance.ActId == actId);
        _dbContext.Appearances.Remove(leaving);
        CloseGap([.. appearances.Where(appearance => appearance != leaving)], leaving);

        if (await LoadAsync(eventId, ct, tracked: true) is not { } order)
            return;

        MarkChanged(order);
        foreach (var rule in order.Rules.Where(rule => Names(rule, actId)).ToList())
            order.Rules.Remove(rule);
        foreach (
            var suspended in order
                .SuspendedWishes.Where(suspended => wishIds.Contains(suspended.ActWishId))
                .ToList()
        )
            order.SuspendedWishes.Remove(suspended);
    }

    private static void CloseGap(IReadOnlyList<Appearance> remaining, Appearance leaving)
    {
        if (leaving.Position is { } gap)
        {
            foreach (var appearance in remaining.Where(appearance => appearance.Position > gap))
                appearance.Position--;
        }

        if (leaving.BlockKey is not { } blockKey)
            return;

        var blockLeft = remaining.Where(appearance => appearance.BlockKey == blockKey).ToList();
        if (blockLeft.Count == 1)
            blockLeft[0].BlockKey = null;
    }

    [Pure]
    private static bool Names(RunningOrderRule rule, int actId) =>
        rule.ActId == actId || rule.OtherActId == actId;

    private Task<bool> IsEventAsync(int eventId, CancellationToken ct) =>
        _dbContext.Events.AnyAsync(row => row.CalendarEntryId == eventId, ct);

    private Task<RunningOrder?> LoadAsync(int eventId, CancellationToken ct, bool tracked)
    {
        var orders = tracked ? _dbContext.RunningOrders : _dbContext.RunningOrders.AsNoTracking();

        return orders
            .Include(order => order.Rules)
            .Include(order => order.SuspendedWishes)
            .AsSplitQuery()
            .SingleOrDefaultAsync(order => order.CalendarEntryId == eventId, ct);
    }

    private async Task<List<Appearance>> AppearancesOfAsync(
        int eventId,
        CancellationToken ct,
        bool tracked
    )
    {
        var appearances = tracked ? _dbContext.Appearances : _dbContext.Appearances.AsNoTracking();

        return await appearances
            .Where(appearance => appearance.CalendarEntryId == eventId)
            .ToListAsync(ct);
    }

    private async Task<string?> RefusalOfAsync(
        int eventId,
        RunningOrderStateCommand state,
        IReadOnlyList<Appearance> existing,
        CancellationToken ct
    )
    {
        if (RunningOrderShape.ProblemOf(state.Lines, state.Rules) is { } problem)
            return ShapeMessages[problem];

        var actIds = state.Lines.Select(line => line.ActId).ToHashSet();
        var acts = await _dbContext
            .Acts.AsNoTracking()
            .Where(act => actIds.Contains(act.Id))
            .Select(act => new
            {
                act.Id,
                act.SessionYear,
                IsArchived = act.ArchivedAt != null,
            })
            .ToListAsync(ct);
        if (acts.Count != actIds.Count)
            return UnknownActMessage;

        var appearingBefore = existing.Select(appearance => appearance.ActId).ToHashSet();
        var newcomers = acts.Where(act => !appearingBefore.Contains(act.Id)).ToList();
        if (newcomers.Any(act => act.IsArchived))
            return ArchivedActMessage;

        var newcomerSessions = newcomers.Select(act => act.SessionYear).ToList();
        if (await SessionRefusalOfAsync(eventId, newcomerSessions, ct) is { } refusedSession)
            return refusedSession;

        var suspendedIds = state.SuspendedActWishIds.ToHashSet();
        var knownWishes = await _dbContext.ActWishes.CountAsync(
            wish => suspendedIds.Contains(wish.Id) && actIds.Contains(wish.ActId),
            ct
        );

        return knownWishes == suspendedIds.Count ? null : UnknownWishMessage;
    }

    private async Task<string?> SessionRefusalOfAsync(
        int eventId,
        IReadOnlyList<int?> sessionYears,
        CancellationToken ct
    )
    {
        if (sessionYears.All(sessionYear => sessionYear is null))
            return null;

        var eveningDay = await EveningDayOfAsync(eventId, ct);
        var today = ClubClock.Today(_timeProvider);

        return
            sessionYears
                .Select(sessionYear =>
                    ActSession.AppearanceProblemOf(sessionYear, eveningDay, today)
                )
                .FirstOrDefault(found => found is not null)
                is { } problem
            ? AppearanceSessionMessages[problem]
            : null;
    }

    private RunningOrder Created(int eventId)
    {
        var order = new RunningOrder { CalendarEntryId = eventId };
        _dbContext.RunningOrders.Add(order);

        return order;
    }

    private async Task<DateOnly> EveningDayOfAsync(int eventId, CancellationToken ct) =>
        ClubClock.DayOf(
            await _dbContext
                .CalendarEntries.Where(entry => entry.Id == eventId)
                .Select(entry => entry.StartsAt)
                .SingleAsync(ct)
        );

    private List<Appearance> SyncAppearances(
        int eventId,
        List<Appearance> appearances,
        IReadOnlyList<RunningOrderLineDraft> drafts
    )
    {
        var wanted = drafts.Select(draft => draft.ActId).ToHashSet();
        _dbContext.Appearances.RemoveRange(
            appearances.Where(appearance => !wanted.Contains(appearance.ActId))
        );
        var kept = appearances
            .Where(appearance => wanted.Contains(appearance.ActId))
            .ToDictionary(appearance => appearance.ActId);

        foreach (var draft in drafts)
        {
            if (!kept.TryGetValue(draft.ActId, out var appearance))
            {
                appearance = new Appearance { CalendarEntryId = eventId, ActId = draft.ActId };
                _dbContext.Appearances.Add(appearance);
                kept.Add(draft.ActId, appearance);
            }

            appearance.Position = draft.Position;
            appearance.IsPinned = draft.IsPinned;
            appearance.BlockKey = draft.BlockKey;
        }

        return [.. kept.Values];
    }

    private static void MarkChanged(RunningOrder order)
    {
        order.Version++;
        order.ChangedSinceConfirmed = order.ConfirmedAt is not null;
    }

    private static void Apply(RunningOrder order, RunningOrderStateCommand state)
    {
        MarkChanged(order);
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

    private async Task<IReadOnlyList<RunningOrderFinding>> FindingsOfAsync(
        RunningOrder order,
        CancellationToken ct
    )
    {
        var lines = InOrder(await AppearancesOfAsync(order.CalendarEntryId, ct, tracked: false));
        var acts = await ActsOnEveningAsync(order.CalendarEntryId, lines, ct);

        return RunningOrderReview.FindingsOf(
            ReviewInputOf(acts, lines, [.. order.Rules], SuspendedOf(order))
        );
    }

    private async Task<RunningOrderDetails> DetailsOfAsync(
        RunningOrder order,
        IReadOnlyList<Appearance> appearances,
        CancellationToken ct
    )
    {
        var lines = InOrder(appearances);
        var acts = await ActsOnEveningAsync(order.CalendarEntryId, lines, ct);
        var suspended = SuspendedOf(order);
        var input = ReviewInputOf(acts, lines, [.. order.Rules], suspended);
        var lineIds = lines.ToDictionary(KeyOf, line => line.Id);

        return new RunningOrderDetails
        {
            EventId = order.CalendarEntryId,
            Version = order.Version,
            ConfirmedAt = order.ConfirmedAt,
            ChangedSinceConfirmed = order.ChangedSinceConfirmed,
            Lines = [.. lines.Select(line => LineDetailsOf(line, acts))],
            Rules = [.. order.Rules.OrderBy(rule => rule.Id).Select(RuleDetailsOf)],
            ActWishes =
            [
                .. acts
                    .Values.SelectMany(act => act.Wishes)
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

    private async Task<IReadOnlyDictionary<int, ActSummary>> ActsOnEveningAsync(
        int eventId,
        IReadOnlyList<Appearance> lines,
        CancellationToken ct
    )
    {
        var eveningDay = await EveningDayOfAsync(eventId, ct);
        var absent = await _dbContext
            .AttendanceResponses.Where(response =>
                response.CalendarEntryId == eventId && response.Answer == AttendanceAnswer.No
            )
            .Select(response => response.PersonId)
            .ToListAsync(ct);
        var actIds = lines.Select(line => line.ActId).ToHashSet();
        var acts = await _catalogue.ActsOnAsync(act => actIds.Contains(act.Id), eveningDay, ct);
        var actsById = acts.ToDictionary(act => act.ActId);
        var absentIds = absent.ToHashSet();

        return lines.ToDictionary(
            line => line.ActId,
            line => WithAbsences(actsById[line.ActId], absentIds)
        );
    }

    [Pure]
    private static IReadOnlyList<Appearance> InOrder(IReadOnlyList<Appearance> appearances) =>
        [
            .. appearances
                .OrderBy(appearance => appearance.Position is null)
                .ThenBy(appearance => appearance.Position)
                .ThenBy(appearance => appearance.Id),
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
        IReadOnlyDictionary<int, ActSummary> acts,
        IReadOnlyList<Appearance> lines,
        IReadOnlyList<RunningOrderRule> rules,
        IReadOnlySet<int> suspended
    ) =>
        new()
        {
            Lines = [.. lines.Select(line => ReviewLineOf(line, acts))],
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
                .. acts
                    .Values.SelectMany(act => act.Wishes)
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
    private static ReviewLine ReviewLineOf(
        Appearance line,
        IReadOnlyDictionary<int, ActSummary> acts
    )
    {
        var act = acts[line.ActId];

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
    private static LineKey KeyOf(Appearance line) => LineKey.OfAct(line.ActId);

    [Pure]
    private static RunningOrderLineDetails LineDetailsOf(
        Appearance line,
        IReadOnlyDictionary<int, ActSummary> acts
    ) =>
        new()
        {
            LineId = line.Id,
            Act = ActDetailsOf(acts[line.ActId]),
            Position = line.Position,
            IsPinned = line.IsPinned,
            BlockKey = line.BlockKey,
        };

    [Pure]
    private static EveningRunningOrderLineDetails EveningLineOf(
        ActSummary act,
        int position,
        bool isOwn
    ) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            Group = act.Group,
            Position = position,
            IsOwn = isOwn,
        };

    [Pure]
    private static bool IsOwn(
        ActSummary act,
        int viewerPersonId,
        IReadOnlySet<int> viewerGroupIds
    ) =>
        act.Group is { } group && viewerGroupIds.Contains(group.GroupId)
        || act.Cast.Any(member => member.PersonId == viewerPersonId);

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
}
