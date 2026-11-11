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
    private const string DecidedProposalMessage = "Über diesen Vorschlag ist schon entschieden.";
    private const string NotApprovedMessage = "Diese Aussage steht nicht im Jeck-Check.";
    private const string PoolFullMessage =
        "Der Jeck-Check hat schon zehn Aussagen. Erst eine löschen, dann freigeben.";
    private const string OrderMismatchMessage =
        "Die Reihenfolge passt nicht mehr zu den freigegebenen Aussagen. Bitte neu laden.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    private IQueryable<MatcherStatement> ApprovedStatements =>
        _dbContext
            .MatcherStatements.AsNoTracking()
            .Where(statement => statement.Status == MatcherStatementStatus.Approved)
            .OrderBy(statement => statement.SortOrder);

    private IQueryable<MatcherStatement> WaitingProposals =>
        _dbContext
            .MatcherStatements.AsNoTracking()
            .Where(statement => statement.Status == MatcherStatementStatus.Proposed);

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
            Proposals = await ProposalsAsync(ct),
            Coverage = CoverageOf(
                statements,
                await CoverageGroupsAsync(ct),
                await StancesAsync(ct)
            ),
        };
    }

    public Task<int> CountWaitingProposalsAsync(CancellationToken ct) =>
        WaitingProposals.CountAsync(ct);

    public Task<int> CountApprovedAsync(CancellationToken ct) => ApprovedStatements.CountAsync(ct);

    public Task<Result> ApproveAsync(int statementId, string? text, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => ApproveLockedAsync(statementId, text, ct), ct);

    public Task<Result> RejectAsync(int statementId, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => RejectLockedAsync(statementId, ct), ct);

    public Task<Result> RewordAsync(int statementId, string text, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => RewordLockedAsync(statementId, text, ct), ct);

    public Task<Result> ReorderAsync(IReadOnlyList<int> statementIds, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => ReorderLockedAsync(statementIds, ct), ct);

    public Task<Result> DeleteAsync(int statementId, CancellationToken ct) =>
        _dbContext.UnderPoolLockAsync(() => DeleteLockedAsync(statementId, ct), ct);

    private async Task<Result> ApproveLockedAsync(
        int statementId,
        string? text,
        CancellationToken ct
    )
    {
        var proposal = await _dbContext.MatcherStatements.SingleOrDefaultAsync(
            statement => statement.Id == statementId,
            ct
        );
        if (proposal is null)
            return Result.NotFound(UnknownStatementMessage);

        if (proposal.Status is not MatcherStatementStatus.Proposed)
            return Result.Conflict(DecidedProposalMessage);

        var approvedCount = await ApprovedStatements.CountAsync(ct);
        if (approvedCount >= MatcherStatement.MaxApproved)
            return Result.Conflict(PoolFullMessage);

        proposal.Status = MatcherStatementStatus.Approved;
        proposal.SortOrder = approvedCount + 1;
        proposal.ApprovedAt = _timeProvider.GetUtcNow();
        proposal.Text = text?.Trim() ?? proposal.Text;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<Result> RejectLockedAsync(int statementId, CancellationToken ct)
    {
        var proposal = await _dbContext.MatcherStatements.SingleOrDefaultAsync(
            statement => statement.Id == statementId,
            ct
        );
        if (proposal is null)
            return Result.NotFound(UnknownStatementMessage);

        if (proposal.Status is not MatcherStatementStatus.Proposed)
            return Result.Conflict(DecidedProposalMessage);

        proposal.Status = MatcherStatementStatus.Rejected;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<Result> RewordLockedAsync(int statementId, string text, CancellationToken ct)
    {
        var statement = await _dbContext.MatcherStatements.SingleOrDefaultAsync(
            row => row.Id == statementId && row.Status == MatcherStatementStatus.Approved,
            ct
        );
        if (statement is null)
            return Result.NotFound(NotApprovedMessage);

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
        var approvedIds = await ApprovedStatements
            .Select(statement => statement.Id)
            .ToListAsync(ct);
        if (!IsSameSet(approvedIds, statementIds))
            return Result.Conflict(OrderMismatchMessage);

        var ids = statementIds.ToArray();
        var approved = nameof(MatcherStatementStatus.Approved);
        var now = _timeProvider.GetUtcNow();
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            UPDATE group_matcher_statement AS statement
            SET sort_order = slot.position, updated_at = {now}
            FROM unnest({ids}) WITH ORDINALITY AS slot(id, position)
            WHERE statement.id = slot.id
              AND statement.status = {approved}
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

        if (slot.SortOrder is { } freedSlot)
            await CloseGapAndStampAsync(freedSlot, _timeProvider.GetUtcNow(), ct);

        return Result.Success();
    }

    private async Task CloseGapAndStampAsync(
        int freedSlot,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await _dbContext
            .MatcherStatements.Where(statement =>
                statement.Status == MatcherStatementStatus.Approved
                && statement.SortOrder > freedSlot
            )
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
    private static bool IsSameSet(
        IReadOnlyList<int> approvedIds,
        IReadOnlyList<int> requestedIds
    ) => approvedIds.Count == requestedIds.Count && approvedIds.ToHashSet().SetEquals(requestedIds);

    [Pure]
    private static IReadOnlyList<GroupCoverageSummary> CoverageOf(
        IReadOnlyList<ApprovedStatementSummary> statements,
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
                            statement.ApprovedAt,
                            statement.RewordedAt,
                            group.JoinedAt
                        ),
                    }),
                ],
            }),
        ];
    }

    private async Task<IReadOnlyList<ApprovedStatementSummary>> PoolStatementsAsync(
        CancellationToken ct
    ) =>
        await ApprovedStatements
            .Select(statement => new ApprovedStatementSummary
            {
                StatementId = statement.Id,
                Text = statement.Text,
                ApprovedAt = statement.ApprovedAt!.Value,
                RewordedAt = statement.RewordedAt,
            })
            .ToListAsync(ct);

    private async Task<IReadOnlyList<WaitingProposalSummary>> ProposalsAsync(
        CancellationToken ct
    ) =>
        await WaitingProposals
            .OrderBy(statement => statement.CreatedAt)
            .ThenBy(statement => statement.Id)
            .Select(statement => new WaitingProposalSummary
            {
                StatementId = statement.Id,
                Text = statement.Text,
                ProposedAt = statement.CreatedAt,
                ProposedBy =
                    statement.ProposedByGroup == null
                        ? null
                        : new MatcherGroupRef
                        {
                            GroupId = statement.ProposedByGroup.Id,
                            Name = statement.ProposedByGroup.Name,
                            Tone = statement.ProposedByGroup.Tone,
                        },
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
            .Where(stance =>
                stance.Statement!.Status == MatcherStatementStatus.Approved
                && stance.Group!.ArchivedOn == null
            )
            .Select(stance => new CoverageStanceRow(
                stance.GroupId,
                stance.StatementId,
                stance.TakenAt
            ))
            .ToListAsync(ct);

    private sealed record CoverageGroupRow(MatcherGroupRef Group, DateTimeOffset? JoinedAt);

    private sealed record CoverageStanceRow(int GroupId, int StatementId, DateTimeOffset TakenAt);
}
