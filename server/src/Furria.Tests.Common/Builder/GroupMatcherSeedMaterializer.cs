using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Tests.Common.Builder;

internal static class GroupMatcherSeedMaterializer
{
    private const string GroupKind = "Group";
    private const string StatementKind = "MatcherStatement";

    private static readonly TimeSpan SeededPoolAge = TimeSpan.FromDays(30);
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
        var statements = recorded
            .Statements.Select(
                (intent, index) => (intent.Alias, Statement: NewStatement(intent, index))
            )
            .ToDictionary(entry => entry.Alias, entry => entry.Statement, StringComparer.Ordinal);
        dbContext.MatcherStatements.AddRange(statements.Values);
        await dbContext.SaveChangesAsync(ct);
        foreach (var intent in recorded.Statements)
            statements[intent.Alias].CreatedAt = intent.AddedAt ?? now - SeededPoolAge;

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
        int index
    ) =>
        new()
        {
            Text = intent.Text,
            SortOrder = index + 1,
            RewordedAt = intent.RewordedAt,
        };

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
