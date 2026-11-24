using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Tests.Common.Builder;

internal static class RoleSeedMaterializer
{
    internal static async Task<SeededRoles> InsertAsync(
        AppDbContext dbContext,
        RoleSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var roles = await InsertRolesAsync(dbContext, recorded, ct);
        var permissions = await InsertPermissionsAsync(dbContext, recorded, roles, ct);
        var holdings = await InsertHoldingsAsync(dbContext, recorded, roles, personIds, ct);

        return new SeededRoles(roles, permissions, holdings);
    }

    private static async Task<Dictionary<string, int>> InsertRolesAsync(
        AppDbContext dbContext,
        RoleSeedBuilder recorded,
        CancellationToken ct
    )
    {
        var roles = recorded.Roles.ToDictionary(
            intent => intent.Alias,
            intent => new Role
            {
                Name = intent.Name,
                Description = intent.Description,
                ArchivedOn = intent.ArchivedOn,
            },
            StringComparer.Ordinal
        );

        if (roles.Count > 0)
        {
            dbContext.Roles.AddRange(roles.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return roles.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertPermissionsAsync(
        AppDbContext dbContext,
        RoleSeedBuilder recorded,
        IReadOnlyDictionary<string, int> roleIds,
        CancellationToken ct
    )
    {
        var permissions = recorded
            .Roles.SelectMany(intent =>
                intent.PermissionKeys.Select(key =>
                    (
                        Alias: PermissionAlias(intent.Alias, key),
                        Row: new RolePermission
                        {
                            RoleId = SeedAliases.RequireId(roleIds, intent.Alias, "Role"),
                            PermissionKey = key,
                        }
                    )
                )
            )
            .ToDictionary(entry => entry.Alias, entry => entry.Row, StringComparer.Ordinal);

        if (permissions.Count > 0)
        {
            dbContext.RolePermissions.AddRange(permissions.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return permissions.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertHoldingsAsync(
        AppDbContext dbContext,
        RoleSeedBuilder recorded,
        IReadOnlyDictionary<string, int> roleIds,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var holdings = recorded.Holdings.ToDictionary(
            intent => intent.Alias,
            intent => new RoleHolding
            {
                RoleId = SeedAliases.RequireId(roleIds, intent.RoleAlias, "Role"),
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                SinceOn = intent.SinceOn,
                UntilOn = intent.UntilOn,
            },
            StringComparer.Ordinal
        );

        if (holdings.Count > 0)
        {
            dbContext.RoleHoldings.AddRange(holdings.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return holdings.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static string PermissionAlias(string roleAlias, string permissionKey) =>
        $"{roleAlias}:{permissionKey}";
}
