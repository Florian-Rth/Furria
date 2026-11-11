using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Tests.Common.Builder;

internal static class GroupMatcherSeedMaterializer
{
    private const string GroupKind = "Group";
    private const string StatementKind = "MatcherStatement";

    private static readonly TimeSpan SeededApprovalAge = TimeSpan.FromDays(30);
    private static readonly TimeSpan SeededStanceAge = TimeSpan.FromDays(20);
    private static readonly TimeSpan SeededJoiningAge = TimeSpan.FromDays(10);

    internal static async Task<SeededGroupMatcher> InsertAsync(
        AppDbContext dbContext,
        GroupMatcherSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupIds,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var statements = recorded.Statements.ToDictionary(
            intent => intent.Alias,
            intent => NewStatement(intent, groupIds, now, recorded.Statements),
            StringComparer.Ordinal
        );
        dbContext.MatcherStatements.AddRange(statements.Values);
        await dbContext.SaveChangesAsync(ct);

        var statementIds = statements.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
        dbContext.Stances.AddRange(
            recorded.Stances.Select(intent => NewStance(intent, groupIds, statementIds, now))
        );
        dbContext.GroupAdmissionAges.AddRange(
            recorded.AdmissionAges.Select(intent => new GroupAdmissionAge
            {
                GroupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, GroupKind),
                Band = intent.Band,
            })
        );
        await StampTakingPartAsync(dbContext, recorded, groupIds, now, ct);
        await dbContext.SaveChangesAsync(ct);

        return new SeededGroupMatcher(statementIds);
    }

    private static MatcherStatement NewStatement(
        GroupMatcherSeedBuilder.StatementIntent intent,
        IReadOnlyDictionary<string, int> groupIds,
        DateTimeOffset now,
        IReadOnlyList<GroupMatcherSeedBuilder.StatementIntent> all
    )
    {
        var isApproved = intent.Status == MatcherStatementStatus.Approved;
        return new()
        {
            Text = intent.Text,
            Status = intent.Status,
            SortOrder = isApproved ? SortOrderOf(intent, all) : null,
            ApprovedAt = isApproved ? intent.ApprovedAt ?? now - SeededApprovalAge : null,
            RewordedAt = intent.RewordedAt,
            ProposedByGroupId = intent.ProposedByGroupAlias is null
                ? null
                : SeedAliases.RequireId(groupIds, intent.ProposedByGroupAlias, GroupKind),
        };
    }

    private static int SortOrderOf(
        GroupMatcherSeedBuilder.StatementIntent intent,
        IReadOnlyList<GroupMatcherSeedBuilder.StatementIntent> all
    ) =>
        all.Where(other => other.Status == MatcherStatementStatus.Approved).ToList().IndexOf(intent)
        + 1;

    private static Stance NewStance(
        GroupMatcherSeedBuilder.StanceIntent intent,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> statementIds,
        DateTimeOffset now
    ) =>
        new()
        {
            GroupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, GroupKind),
            StatementId = SeedAliases.RequireId(statementIds, intent.StatementAlias, StatementKind),
            Position = intent.Position,
            Importance = intent.Importance,
            TakenAt = intent.TakenAt ?? now - SeededStanceAge,
        };

    private static async Task StampTakingPartAsync(
        AppDbContext dbContext,
        GroupMatcherSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupIds,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        foreach (var intent in recorded.TakingPart)
        {
            var groupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, GroupKind);
            var group = await dbContext.Groups.SingleAsync(row => row.Id == groupId, ct);
            group.GroupMatcherJoinedAt = intent.JoinedAt ?? now - SeededJoiningAge;
        }
    }
}
