using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class ActService
{
    private const string UnknownActMessage = "Diesen Auftritt gibt es nicht.";
    private const string ArchivedActMessage =
        "Ein archivierter Auftritt lässt sich nicht bearbeiten.";
    private const string AlreadyArchivedMessage = "Dieser Auftritt ist bereits archiviert.";
    private const string NotArchivedMessage = "Dieser Auftritt ist nicht archiviert.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht mehr im Verzeichnis.";
    private const string ArchivedGroupMessage =
        "Eine archivierte Gruppe lässt sich keinem Auftritt zuordnen.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string AddedAndRemovedMessage =
        "Eine Person kann nicht zugleich hinzugefügt und herausgenommen werden.";
    private const string RemovedWithoutGroupMessage =
        "Aus einem Auftritt ohne Gruppe lässt sich niemand herausnehmen.";
    private const string ForeignGroupMessage =
        "Auftritte anderer Gruppen lassen sich hier nicht bearbeiten.";
    private const string UnknownWishMessage = "Diesen Wunsch gibt es für einen Auftritt nicht.";
    private const string RepeatedWishMessage = "Jeder Wunsch steht nur einmal an einem Auftritt.";
    private const string ClosedSessionMessage =
        "Die Session dieses Auftritts ist vorbei, er bleibt so, wie er war.";

    private static readonly IReadOnlyDictionary<ActSessionProblem, string> SessionMessages =
        new Dictionary<ActSessionProblem, string>
        {
            [ActSessionProblem.PastSession] = "Eine vergangene Session lässt sich nicht wählen.",
            [ActSessionProblem.SessionOnTimelessAct] = "Ein Ablaufpunkt gehört zu keiner Session.",
        };

    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly TimeProvider _timeProvider;

    public ActService(AppDbContext dbContext, ActCatalogue catalogue, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _timeProvider = timeProvider;
    }

    public async Task<SessionActsDetails> GetActsAsync(
        ActScope scope,
        int? sessionYear,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var relevantYear = ClubSession.RelevantYearOf(today);
        var shownYear = sessionYear ?? relevantYear;
        var withTimeless = !ActSession.IsClosed(shownYear, today);
        var recordedYears = await _dbContext
            .Acts.AsNoTracking()
            .Where(WithinScope(scope))
            .Where(act => act.SessionYear != null)
            .Select(act => act.SessionYear!.Value)
            .Distinct()
            .ToListAsync(ct);

        return new SessionActsDetails
        {
            SessionYear = shownYear,
            SessionYears =
            [
                .. recordedYears
                    .Append(relevantYear)
                    .Append(shownYear)
                    .Distinct()
                    .OrderDescending(),
            ],
            Acts = await _catalogue.ActsOnAsync(ShownIn(scope, shownYear, withTimeless), today, ct),
        };
    }

    public async Task FreezeClosedCastsAsync(CancellationToken ct)
    {
        var relevantYear = ClubSession.RelevantYearOf(ClubClock.Today(_timeProvider));
        var due = await _dbContext
            .Acts.Where(act =>
                act.SessionYear != null
                && act.SessionYear < relevantYear
                && act.CastFrozenAt == null
            )
            .ToListAsync(ct);

        foreach (var session in due.GroupBy(act => act.SessionYear!.Value))
            await FreezeAsync(session.Key, [.. session], ct);

        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<Result<int>> CreateAsync(
        ActScope scope,
        ActFactsCommand facts,
        CancellationToken ct
    )
    {
        if (!scope.Covers(facts.GroupId))
            return Result<int>.Forbidden(ForeignGroupMessage);

        var today = ClubClock.Today(_timeProvider);
        var refusal = await RefusalOfAsync(facts, null, today, ct);
        if (refusal is { } refused)
            return Result<int>.Validation(refused);

        var act = new Act();
        Apply(act, facts, today);
        _dbContext.Acts.Add(act);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(act.Id);
    }

    public async Task<Result> UpdateAsync(
        ActScope scope,
        UpdateActCommand command,
        CancellationToken ct
    )
    {
        var act = await _dbContext
            .Acts.Include(row => row.CastChanges)
            .Include(row => row.Wishes)
            .SingleOrDefaultAsync(row => row.Id == command.ActId, ct);
        if (act is null)
            return Result.NotFound(UnknownActMessage);
        if (!scope.AllowsEditing(act.GroupId, command.Facts.GroupId))
            return Result.Forbidden(ForeignGroupMessage);
        if (act.ArchivedAt is not null)
            return Result.Conflict(ArchivedActMessage);

        var today = ClubClock.Today(_timeProvider);
        if (ActSession.IsClosed(act.SessionYear, today))
            return Result.Conflict(ClosedSessionMessage);

        var refusal = await RefusalOfAsync(command.Facts, act.GroupId, today, ct);
        if (refusal is { } refused)
            return Result.Validation(refused);

        Apply(
            act,
            command.Facts with
            {
                SessionYear = command.Facts.SessionYear ?? act.SessionYear,
            },
            today
        );
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> SetArchivedAsync(
        ActScope scope,
        SetActArchivedCommand command,
        CancellationToken ct
    )
    {
        var act = await _dbContext.Acts.SingleOrDefaultAsync(row => row.Id == command.ActId, ct);
        if (act is null)
            return Result.NotFound(UnknownActMessage);
        if (!scope.Covers(act.GroupId))
            return Result.Forbidden(ForeignGroupMessage);
        if (ActSession.IsClosed(act.SessionYear, ClubClock.Today(_timeProvider)))
            return Result.Conflict(ClosedSessionMessage);
        if (command.Archived == act.ArchivedAt is not null)
            return Result.Conflict(command.Archived ? AlreadyArchivedMessage : NotArchivedMessage);

        act.ArchivedAt = command.Archived ? _timeProvider.GetUtcNow() : null;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task<string?> RefusalOfAsync(
        ActFactsCommand facts,
        int? currentGroupId,
        DateOnly today,
        CancellationToken ct
    ) =>
        ShapeRefusalOf(facts)
        ?? SessionRefusalOf(facts, today)
        ?? await GroupRefusalOfAsync(facts.GroupId, currentGroupId, ct)
        ?? await PersonRefusalOfAsync(facts, ct);

    private async Task FreezeAsync(int sessionYear, IReadOnlyList<Act> acts, CancellationToken ct)
    {
        var actIds = acts.Select(act => act.Id).ToList();
        var casts = await _catalogue.ActsOnAsync(
            act => actIds.Contains(act.Id),
            ActSession.CastFreezeDayOf(sessionYear),
            ct
        );
        var castOfAct = casts.ToDictionary(cast => cast.ActId, cast => cast.Cast);
        var frozenAt = _timeProvider.GetUtcNow();

        foreach (var act in acts)
        {
            act.CastFrozenAt = frozenAt;
            foreach (var member in castOfAct[act.Id])
                act.FrozenCast.Add(new FrozenCastMember { PersonId = member.PersonId });
        }
    }

    [Pure]
    private static Expression<Func<Act, bool>> ShownIn(
        ActScope scope,
        int sessionYear,
        bool withTimeless
    )
    {
        var groupIds = scope.GroupIds;

        return act =>
            (groupIds == null || (act.GroupId != null && groupIds.Contains(act.GroupId.Value)))
            && (act.SessionYear == sessionYear || (withTimeless && act.SessionYear == null));
    }

    [Pure]
    private static string? SessionRefusalOf(ActFactsCommand facts, DateOnly today) =>
        ActSession.ProblemOf(facts.Kind, facts.SessionYear, today) is { } problem
            ? SessionMessages[problem]
            : null;

    [Pure]
    private static Expression<Func<Act, bool>> WithinScope(ActScope scope) =>
        scope.GroupIds is { } groupIds
            ? act => act.GroupId != null && groupIds.Contains(act.GroupId.Value)
            : _ => true;

    [Pure]
    private static string? ShapeRefusalOf(ActFactsCommand facts) =>
        facts.AddedPersonIds.Intersect(facts.RemovedPersonIds).Any() ? AddedAndRemovedMessage
        : facts.GroupId is null && facts.RemovedPersonIds.Count > 0 ? RemovedWithoutGroupMessage
        : facts.Wishes.Any(wish => !RunningOrderRuleKinds.ActWishKinds.Contains(wish.Kind))
            ? UnknownWishMessage
        : facts.Wishes.DistinctBy(wish => wish.Kind).Count() != facts.Wishes.Count
            ? RepeatedWishMessage
        : null;

    private async Task<string?> GroupRefusalOfAsync(
        int? groupId,
        int? currentGroupId,
        CancellationToken ct
    )
    {
        if (groupId is null || groupId == currentGroupId)
            return null;

        var group = await _dbContext
            .Groups.AsNoTracking()
            .Where(row => row.Id == groupId)
            .Select(row => new { row.ArchivedOn })
            .SingleOrDefaultAsync(ct);

        return group is null ? UnknownGroupMessage
            : group.ArchivedOn is not null ? ArchivedGroupMessage
            : null;
    }

    private async Task<string?> PersonRefusalOfAsync(ActFactsCommand facts, CancellationToken ct)
    {
        var personIds = facts.AddedPersonIds.Concat(facts.RemovedPersonIds).ToHashSet();
        var known = await _dbContext.People.CountAsync(person => personIds.Contains(person.Id), ct);

        return known == personIds.Count ? null : UnknownPersonMessage;
    }

    private static void Apply(Act act, ActFactsCommand facts, DateOnly today)
    {
        act.Name = facts.Name.Trim();
        act.GroupId = facts.GroupId;
        act.Kind = facts.Kind;
        act.SessionYear = ActSession.YearFor(facts.Kind, facts.SessionYear, today);
        SyncCastChanges(act, facts);
        SyncWishes(act, facts.Wishes);
    }

    private static void SyncCastChanges(Act act, ActFactsCommand facts)
    {
        var wanted = facts
            .AddedPersonIds.Distinct()
            .Select(personId => (PersonId: personId, Change: CastChange.Added))
            .Concat(
                facts
                    .RemovedPersonIds.Distinct()
                    .Select(personId => (PersonId: personId, Change: CastChange.Removed))
            )
            .ToDictionary(pair => pair.PersonId, pair => pair.Change);

        foreach (
            var stale in act.CastChanges.Where(row => !wanted.ContainsKey(row.PersonId)).ToList()
        )
            act.CastChanges.Remove(stale);

        foreach (var (personId, change) in wanted)
        {
            var existing = act.CastChanges.SingleOrDefault(row => row.PersonId == personId);
            if (existing is null)
                act.CastChanges.Add(new ActCastChange { PersonId = personId, Change = change });
            else
                existing.Change = change;
        }
    }

    private static void SyncWishes(Act act, IReadOnlyList<ActWishInput> wishes)
    {
        var wanted = wishes.ToDictionary(wish => wish.Kind, wish => wish.Strength);

        foreach (var stale in act.Wishes.Where(row => !wanted.ContainsKey(row.Kind)).ToList())
            act.Wishes.Remove(stale);

        foreach (var (kind, strength) in wanted)
        {
            var existing = act.Wishes.SingleOrDefault(row => row.Kind == kind);
            if (existing is null)
                act.Wishes.Add(new ActWish { Kind = kind, Strength = strength });
            else
                existing.Strength = strength;
        }
    }
}
