using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Tests.Common.Builder;

internal static class GroupSeedMaterializer
{
    internal static async Task<SeededGroups> InsertAsync(
        AppDbContext dbContext,
        GroupSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var groupKinds = await InsertGroupKindsAsync(dbContext, recorded, ct);
        var groups = await InsertGroupsAsync(dbContext, recorded, groupKinds, ct);
        var memberships = await InsertMembershipsAsync(dbContext, recorded, groups, personIds, ct);
        var admins = await InsertAdminsAsync(dbContext, recorded, groups, personIds, ct);

        return new SeededGroups(groupKinds, groups, memberships, admins);
    }

    private static async Task<Dictionary<string, int>> InsertGroupKindsAsync(
        AppDbContext dbContext,
        GroupSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var kinds = recorded.GroupKinds.ToDictionary(
            intent => intent.Alias,
            intent => new GroupKind
            {
                Name = intent.Name,
                SortOrder = intent.SortOrder,
                ArchivedOn = intent.ArchivedOn,
            },
            StringComparer.Ordinal
        );

        if (kinds.Count > 0)
        {
            dbContext.GroupKinds.AddRange(kinds.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return kinds.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertGroupsAsync(
        AppDbContext dbContext,
        GroupSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupKindIds,
        CancellationToken ct
    )
    {
        var groups = recorded.Groups.ToDictionary(
            intent => intent.Alias,
            intent => new Group
            {
                Name = intent.Name,
                Description = intent.Description,
                IsRecruiting = intent.IsRecruiting,
                ArchivedOn = intent.ArchivedOn,
                GroupKindId = OptionalId(groupKindIds, intent.GroupKindAlias, "Gruppenart"),
                FoundedYear = intent.FoundedYear,
                Tone = intent.Tone,
            },
            StringComparer.Ordinal
        );

        if (groups.Count > 0)
        {
            dbContext.Groups.AddRange(groups.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return groups.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static int? OptionalId(
        IReadOnlyDictionary<string, int> ids,
        string? alias,
        string kind
    ) => alias is null ? null : SeedAliases.RequireId(ids, alias, kind);

    private static async Task<Dictionary<string, int>> InsertMembershipsAsync(
        AppDbContext dbContext,
        GroupSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var memberships = recorded.Memberships.ToDictionary(
            intent => intent.Alias,
            intent => new GroupMembership
            {
                GroupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, "Gruppe"),
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                JoinedOn = intent.JoinedOn,
                LeftOn = intent.LeftOn,
            },
            StringComparer.Ordinal
        );

        if (memberships.Count > 0)
        {
            dbContext.GroupMemberships.AddRange(memberships.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return memberships.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertAdminsAsync(
        AppDbContext dbContext,
        GroupSeedBuilder recorded,
        IReadOnlyDictionary<string, int> groupIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var admins = recorded.Admins.ToDictionary(
            intent => intent.Alias,
            intent => new GroupAdmin
            {
                GroupId = SeedAliases.RequireId(groupIds, intent.GroupAlias, "Gruppe"),
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                Function = intent.Function,
                SinceOn = intent.SinceOn,
                UntilOn = intent.UntilOn,
            },
            StringComparer.Ordinal
        );

        if (admins.Count > 0)
        {
            dbContext.GroupAdmins.AddRange(admins.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return admins.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }
}
