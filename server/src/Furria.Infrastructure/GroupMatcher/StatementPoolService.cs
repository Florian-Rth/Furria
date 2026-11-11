using System.Diagnostics.Contracts;
using Furria.Application.GroupMatcher;
using Furria.Application.Results;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.GroupMatcher;

public sealed class StatementPoolService
{
    private const string UnknownStatementMessage = "Diese Aussage gibt es nicht.";
    private const string PoolFullMessage =
        "Der Jeck-Check hat schon zehn Aussagen. Erst eine löschen, dann hinzufügen.";
    private const string OrderMismatchMessage =
        "Die Reihenfolge passt nicht mehr zu den Aussagen im Jeck-Check. Bitte neu laden.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    private IQueryable<MatcherStatement> PoolStatements =>
        _dbContext.MatcherStatements.AsNoTracking().OrderBy(statement => statement.SortOrder);

    public StatementPoolService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<StatementPoolDetails> GetAsync(CancellationToken ct)
    {
        var statements = await PoolStatementsAsync(ct);

        return new StatementPoolDetails
        {
            Statements = statements,
            Coverage = CoverageOf(
                statements,
                await CoverageGroupsAsync(ct),
                await StancesAsync(ct)
            ),
        };
    }

    public Task<int> CountAsync(CancellationToken ct) => PoolStatements.CountAsync(ct);

    public async Task<Result<int>> AddAsync(string text, CancellationToken ct)
    {
        var statement = new MatcherStatement { Text = text.Trim() };
        var added = await _dbContext.UnderPoolLockAsync(() => AddLockedAsync(statement, ct), ct);

        return added.IsSuccess ? Result<int>.Success(statement.Id) : Result<int>.Carrying(added);
    }

    public Task<Result> RewordAsync(int statementId, string text, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => RewordLockedAsync(statementId, text, ct), ct);

    public Task<Result> ReorderAsync(IReadOnlyList<int> statementIds, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => ReorderLockedAsync(statementIds, ct), ct);

    public Task<Result> DeleteAsync(int statementId, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => DeleteLockedAsync(statementId, ct), ct);

    private async Task<Result> AddLockedAsync(MatcherStatement statement, CancellationToken ct)
    {
        var statementCount = await PoolStatements.CountAsync(ct);
        if (statementCount >= MatcherStatement.MaxInPool)
            return Result.Conflict(PoolFullMessage);

        statement.SortOrder = statementCount + 1;
        _dbContext.MatcherStatements.Add(statement);

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<Result> RewordLockedAsync(int statementId, string text, CancellationToken ct)
    {
        var statement = await _dbContext.MatcherStatements.SingleOrDefaultAsync(
            row => row.Id == statementId,
            ct
        );
        if (statement is null)
            return Result.NotFound(UnknownStatementMessage);

        var reworded = text.Trim();
        if (reworded == statement.Text)
            return Result.Success();

        statement.Text = reworded;
        statement.RewordedAt = _timeProvider.GetUtcNow();

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<Result> ReorderLockedAsync(
        IReadOnlyList<int> statementIds,
        CancellationToken ct
    )
    {
        var poolIds = await PoolStatements.Select(statement => statement.Id).ToListAsync(ct);
        if (!IsSameSet(poolIds, statementIds))
            return Result.Conflict(OrderMismatchMessage);

        var ids = statementIds.ToArray();
        var now = _timeProvider.GetUtcNow();
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            UPDATE group_matcher_statement AS statement
            SET sort_order = slot.position, updated_at = {now}
            FROM unnest({ids}) WITH ORDINALITY AS slot(id, position)
            WHERE statement.id = slot.id
              AND statement.sort_order IS DISTINCT FROM slot.position
            """,
            ct
        );

        return Result.Success();
    }

    private async Task<Result> DeleteLockedAsync(int statementId, CancellationToken ct)
    {
        var slot = await _dbContext
            .MatcherStatements.AsNoTracking()
            .Where(statement => statement.Id == statementId)
            .Select(statement => new { statement.SortOrder })
            .SingleOrDefaultAsync(ct);
        if (slot is null)
            return Result.NotFound(UnknownStatementMessage);

        await _dbContext
            .MatcherStatements.Where(statement => statement.Id == statementId)
            .ExecuteDeleteAsync(ct);

        await CloseGapAndStampAsync(slot.SortOrder, _timeProvider.GetUtcNow(), ct);

        return Result.Success();
    }

    private async Task CloseGapAndStampAsync(
        int freedSlot,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await _dbContext
            .MatcherStatements.Where(statement => statement.SortOrder > freedSlot)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(
                            statement => statement.SortOrder,
                            statement => statement.SortOrder - 1
                        )
                        .SetProperty(statement => statement.UpdatedAt, now),
                ct
            );

        await _dbContext.StampCompleteAsync(
            _dbContext.Groups.Where(group => group.ArchivedOn == null),
            now,
            ct
        );
    }

    [Pure]
    private static bool IsSameSet(IReadOnlyList<int> poolIds, IReadOnlyList<int> requestedIds) =>
        poolIds.Count == requestedIds.Count && poolIds.ToHashSet().SetEquals(requestedIds);

    [Pure]
    private static IReadOnlyList<GroupCoverageSummary> CoverageOf(
        IReadOnlyList<PoolStatementSummary> statements,
        IReadOnlyList<CoverageGroupRow> groups,
        IReadOnlyList<CoverageStanceRow> stances
    )
    {
        var takenAtByKey = stances.ToDictionary(
            stance => (stance.GroupId, stance.StatementId),
            stance => (DateTimeOffset?)stance.TakenAt
        );

        return
        [
            .. groups.Select(group => new GroupCoverageSummary
            {
                Group = group.Group,
                IsTakingPart = group.JoinedAt is not null,
                Cells =
                [
                    .. statements.Select(statement => new CoverageCell
                    {
                        StatementId = statement.StatementId,
                        State = StatementStates.Of(
                            takenAtByKey.GetValueOrDefault(
                                (group.Group.GroupId, statement.StatementId)
                            ),
                            statement.AddedAt,
                            statement.RewordedAt,
                            group.JoinedAt
                        ),
                    }),
                ],
            }),
        ];
    }

    private async Task<IReadOnlyList<PoolStatementSummary>> PoolStatementsAsync(
        CancellationToken ct
    ) =>
        await PoolStatements
            .Select(statement => new PoolStatementSummary
            {
                StatementId = statement.Id,
                Text = statement.Text,
                AddedAt = statement.CreatedAt,
                RewordedAt = statement.RewordedAt,
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<CoverageGroupRow>> CoverageGroupsAsync(CancellationToken ct) =>
        await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new CoverageGroupRow(
                new MatcherGroupRef
                {
                    GroupId = group.Id,
                    Name = group.Name,
                    Tone = group.Tone,
                },
                group.GroupMatcherJoinedAt
            ))
            .ToListAsync(ct);

    private async Task<IReadOnlyList<CoverageStanceRow>> StancesAsync(CancellationToken ct) =>
        await _dbContext
            .Stances.AsNoTracking()
            .Where(stance => stance.Group!.ArchivedOn == null)
            .Select(stance => new CoverageStanceRow(
                stance.GroupId,
                stance.StatementId,
                stance.TakenAt
            ))
            .ToListAsync(ct);

    private sealed record CoverageGroupRow(MatcherGroupRef Group, DateTimeOffset? JoinedAt);

    private sealed record CoverageStanceRow(int GroupId, int StatementId, DateTimeOffset TakenAt);
}
