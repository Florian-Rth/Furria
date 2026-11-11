using System.Diagnostics.Contracts;
using Furria.Application.GroupMatcher;
using Furria.Application.Results;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.GroupMatcher;

public sealed class GroupMatcherService
{
    private const int FewestTakingPart = 2;
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht mehr im Verzeichnis.";
    private const string ArchivedGroupMessage =
        "Eine archivierte Gruppe kann beim Jeck-Check nicht mitmachen.";
    private const string UnknownStatementMessage = "Diese Aussage steht nicht im Jeck-Check.";
    private const string UnknownProposalMessage = "Diesen Vorschlag gibt es nicht.";
    private const string DecidedProposalMessage = "Über diesen Vorschlag ist schon entschieden.";

    private readonly AppDbContext _dbContext;
    private readonly PublicFace _publicFace;
    private readonly TimeProvider _timeProvider;

    private IQueryable<MatcherStatement> ApprovedStatements =>
        _dbContext
            .MatcherStatements.AsNoTracking()
            .Where(statement => statement.Status == MatcherStatementStatus.Approved)
            .OrderBy(statement => statement.SortOrder)
            .ThenBy(statement => statement.Id);

    public GroupMatcherService(
        AppDbContext dbContext,
        PublicFace publicFace,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _publicFace = publicFace;
        _timeProvider = timeProvider;
    }

    public async Task<Result<GroupMatcherPageDetails>> GetPageAsync(
        int groupId,
        CancellationToken ct
    )
    {
        var group = await GroupStateAsync(groupId, ct);
        if (group is null)
            return Result<GroupMatcherPageDetails>.NotFound(UnknownGroupMessage);

        return Result<GroupMatcherPageDetails>.Success(
            new GroupMatcherPageDetails
            {
                IsTakingPart = group.IsTakingPart,
                Statements = await StatementsOfAsync(groupId, group.JoinedAt, ct),
                AdmissionAges = await AdmissionAgesOfAsync(groupId, ct),
                Proposals = await ProposalsOfAsync(groupId, ct),
            }
        );
    }

    public async Task<GroupMatcherStatusDetails> GetStatusAsync(int groupId, CancellationToken ct)
    {
        var group = await GroupStateAsync(groupId, ct);

        return new GroupMatcherStatusDetails
        {
            IsTakingPart = group?.IsTakingPart ?? false,
            OpenStatements = await ApprovedStatements.CountAsync(
                statement =>
                    !statement.Stances.Any(stance =>
                        stance.GroupId == groupId
                        && (statement.RewordedAt == null || statement.RewordedAt <= stance.TakenAt)
                    ),
                ct
            ),
        };
    }

    public async Task<Result> TakeStanceAsync(TakeStanceCommand command, CancellationToken ct)
    {
        if (await GroupRefusalAsync(command.GroupId, ct) is { } refusal)
            return refusal;

        if (!await ApprovedStatements.AnyAsync(row => row.Id == command.StatementId, ct))
            return Result.NotFound(UnknownStatementMessage);

        var now = _timeProvider.GetUtcNow();
        await UpsertStanceAsync(command, now, ct);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return saved;

        await StampTakingPartAsync(command.GroupId, now, ct);
        return Result.Success();
    }

    public async Task<Result> SetAdmissionAgesAsync(
        int groupId,
        IReadOnlyCollection<AdmissionAgeBand> bands,
        CancellationToken ct
    )
    {
        if (await GroupRefusalAsync(groupId, ct) is { } refusal)
            return refusal;

        var current = await _dbContext
            .GroupAdmissionAges.Where(admissionAge => admissionAge.GroupId == groupId)
            .ToListAsync(ct);

        _dbContext.GroupAdmissionAges.RemoveRange(
            current.Where(admissionAge => !bands.Contains(admissionAge.Band))
        );
        _dbContext.GroupAdmissionAges.AddRange(
            AddedBands(current, bands)
                .Select(band => new GroupAdmissionAge { GroupId = groupId, Band = band })
        );

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result<int>> ProposeAsync(int groupId, string text, CancellationToken ct)
    {
        if (await GroupRefusalAsync(groupId, ct) is { } refusal)
            return Result<int>.Carrying(refusal);

        var statement = new MatcherStatement
        {
            Text = text.Trim(),
            Status = MatcherStatementStatus.Proposed,
            ProposedByGroupId = groupId,
        };
        _dbContext.MatcherStatements.Add(statement);

        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(statement.Id);
    }

    public async Task<Result> WithdrawProposalAsync(
        int groupId,
        int statementId,
        CancellationToken ct
    )
    {
        var proposal = await _dbContext.MatcherStatements.SingleOrDefaultAsync(
            statement => statement.Id == statementId && statement.ProposedByGroupId == groupId,
            ct
        );
        if (proposal is null)
            return Result.NotFound(UnknownProposalMessage);

        if (proposal.Status is not MatcherStatementStatus.Proposed)
            return Result.Conflict(DecidedProposalMessage);

        _dbContext.MatcherStatements.Remove(proposal);

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<PublicGroupMatcherDetails?> GetPublicAsync(CancellationToken ct)
    {
        var statements = await ApprovedStatements
            .Select(statement => new StatementRow(statement.Id, statement.Text))
            .ToListAsync(ct);
        if (statements.Count == 0)
            return null;

        var groups = await PublicGroupProjection
            .InNameOrder(_publicFace.Groups.Where(group => group.GroupMatcherJoinedAt != null))
            .ToListAsync(ct);
        if (groups.Count < FewestTakingPart)
            return null;

        var groupIds = groups.Select(group => group.GroupId).ToList();

        return new PublicGroupMatcherDetails
        {
            Groups = groups,
            Statements = WithStances(statements, await PublicStancesAsync(groupIds, ct)),
            AdmissionAges = await PublicAdmissionAgesAsync(groupIds, ct),
        };
    }

    [Pure]
    private static IEnumerable<AdmissionAgeBand> AddedBands(
        IReadOnlyCollection<GroupAdmissionAge> current,
        IReadOnlyCollection<AdmissionAgeBand> wanted
    ) => wanted.Distinct().Except(current.Select(admissionAge => admissionAge.Band));

    private async Task<IReadOnlyList<GroupStatementSummary>> StatementsOfAsync(
        int groupId,
        DateTimeOffset? joinedAt,
        CancellationToken ct
    )
    {
        var rows = await ApprovedStatements
            .Select(statement => new GroupStatementRow(
                statement.Id,
                statement.Text,
                statement.ApprovedAt!.Value,
                statement.RewordedAt,
                statement
                    .Stances.Where(stance => stance.GroupId == groupId)
                    .Select(stance => new StanceRow(
                        stance.Position,
                        stance.Importance,
                        stance.TakenAt
                    ))
                    .FirstOrDefault()
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, joinedAt))];
    }

    [Pure]
    private static GroupStatementSummary ToSummary(
        GroupStatementRow row,
        DateTimeOffset? joinedAt
    ) =>
        new()
        {
            StatementId = row.Id,
            Text = row.Text,
            Position = row.Stance?.Position,
            Importance = row.Stance?.Importance,
            State = StatementStates.Of(
                row.Stance?.TakenAt,
                row.ApprovedAt,
                row.RewordedAt,
                joinedAt
            ),
        };

    private async Task<IReadOnlyList<AdmissionAgeBand>> AdmissionAgesOfAsync(
        int groupId,
        CancellationToken ct
    )
    {
        var bands = await _dbContext
            .GroupAdmissionAges.AsNoTracking()
            .Where(admissionAge => admissionAge.GroupId == groupId)
            .Select(admissionAge => admissionAge.Band)
            .ToListAsync(ct);

        return [.. bands.Order()];
    }

    private async Task<IReadOnlyList<GroupProposalSummary>> ProposalsOfAsync(
        int groupId,
        CancellationToken ct
    ) =>
        await _dbContext
            .MatcherStatements.AsNoTracking()
            .Where(statement =>
                statement.ProposedByGroupId == groupId
                && statement.Status != MatcherStatementStatus.Approved
            )
            .OrderByDescending(statement => statement.CreatedAt)
            .ThenByDescending(statement => statement.Id)
            .Select(statement => new GroupProposalSummary
            {
                StatementId = statement.Id,
                Text = statement.Text,
                Status = statement.Status,
                ProposedAt = statement.CreatedAt,
            })
            .ToListAsync(ct);

    private async Task UpsertStanceAsync(
        TakeStanceCommand command,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var stance = await _dbContext.Stances.SingleOrDefaultAsync(
            row => row.GroupId == command.GroupId && row.StatementId == command.StatementId,
            ct
        );
        if (stance is null)
        {
            stance = new Stance { GroupId = command.GroupId, StatementId = command.StatementId };
            _dbContext.Stances.Add(stance);
        }

        stance.Position = command.Position;
        stance.Importance = command.Importance;
        stance.TakenAt = now;
    }

    private Task StampTakingPartAsync(int groupId, DateTimeOffset now, CancellationToken ct) =>
        _dbContext
            .Groups.Where(group =>
                group.Id == groupId
                && group.GroupMatcherJoinedAt == null
                && !_dbContext.MatcherStatements.Any(statement =>
                    statement.Status == MatcherStatementStatus.Approved
                    && !statement.Stances.Any(stance => stance.GroupId == groupId)
                )
            )
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(group => group.GroupMatcherJoinedAt, now)
                        .SetProperty(group => group.UpdatedAt, now),
                ct
            );

    private async Task<Result?> GroupRefusalAsync(int groupId, CancellationToken ct)
    {
        var group = await GroupStateAsync(groupId, ct);
        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        return group.IsArchived ? Result.Conflict(ArchivedGroupMessage) : null;
    }

    private Task<GroupStateRow?> GroupStateAsync(int groupId, CancellationToken ct) =>
        _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId)
            .Select(group => new GroupStateRow(
                group.ArchivedOn != null,
                group.GroupMatcherJoinedAt
            ))
            .SingleOrDefaultAsync(ct);

    private async Task<IReadOnlyList<StanceOfGroupRow>> PublicStancesAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    ) =>
        await _dbContext
            .Stances.AsNoTracking()
            .Where(stance =>
                groupIds.Contains(stance.GroupId)
                && stance.Statement!.Status == MatcherStatementStatus.Approved
            )
            .Select(stance => new StanceOfGroupRow(
                stance.StatementId,
                stance.GroupId,
                stance.Position,
                stance.Importance
            ))
            .ToListAsync(ct);

    private async Task<IReadOnlyList<PublicAdmissionAgesSummary>> PublicAdmissionAgesAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .GroupAdmissionAges.AsNoTracking()
            .Where(admissionAge => groupIds.Contains(admissionAge.GroupId))
            .Select(admissionAge => new { admissionAge.GroupId, admissionAge.Band })
            .ToListAsync(ct);

        return
        [
            .. groupIds.Select(groupId => new PublicAdmissionAgesSummary
            {
                GroupId = groupId,
                Bands =
                [
                    .. rows.Where(row => row.GroupId == groupId).Select(row => row.Band).Order(),
                ],
            }),
        ];
    }

    [Pure]
    private static IReadOnlyList<PublicStatementSummary> WithStances(
        IReadOnlyList<StatementRow> statements,
        IReadOnlyList<StanceOfGroupRow> stances
    )
    {
        var stancesByStatement = stances.ToLookup(stance => stance.StatementId);

        return
        [
            .. statements.Select(statement => new PublicStatementSummary
            {
                StatementId = statement.Id,
                Text = statement.Text,
                Stances = [.. stancesByStatement[statement.Id].Select(ToPublicStance)],
            }),
        ];
    }

    [Pure]
    private static PublicStanceSummary ToPublicStance(StanceOfGroupRow stance) =>
        new()
        {
            GroupId = stance.GroupId,
            Position = stance.Position,
            Importance = stance.Importance,
        };

    private sealed record GroupStateRow(bool IsArchived, DateTimeOffset? JoinedAt)
    {
        public bool IsTakingPart => JoinedAt is not null && !IsArchived;
    }

    private sealed record StatementRow(int Id, string Text);

    private sealed record GroupStatementRow(
        int Id,
        string Text,
        DateTimeOffset ApprovedAt,
        DateTimeOffset? RewordedAt,
        StanceRow? Stance
    );

    private sealed record StanceRow(
        StancePosition Position,
        int Importance,
        DateTimeOffset TakenAt
    );

    private sealed record StanceOfGroupRow(
        int StatementId,
        int GroupId,
        StancePosition Position,
        int Importance
    );
}
