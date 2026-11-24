namespace Furria.Tests.Common.Builder;

public sealed class RoleSeedBuilder
{
    private static readonly DateOnly DefaultSinceOn = new(2020, 11, 11);

    private readonly List<RoleIntent> _roles = [];
    private readonly List<RoleHoldingIntent> _holdings = [];

    internal IReadOnlyList<RoleIntent> Roles => _roles;

    internal IReadOnlyList<RoleHoldingIntent> Holdings => _holdings;

    public RoleSeedBuilder AddRole(string alias, string name, params string[] permissionKeys) =>
        AddRoleWithDetails(alias, name, "", archivedOn: null, permissionKeys);

    public RoleSeedBuilder AddRoleWithDetails(
        string alias,
        string name,
        string description,
        DateOnly? archivedOn,
        params string[] permissionKeys
    )
    {
        _roles.Add(new RoleIntent(alias, name, description, archivedOn, permissionKeys));
        return this;
    }

    public RoleSeedBuilder AddRoleHolding(
        string alias,
        string roleAlias,
        string personAlias,
        DateOnly? sinceOn = null,
        DateOnly? untilOn = null
    )
    {
        _holdings.Add(
            new RoleHoldingIntent(alias, roleAlias, personAlias, sinceOn ?? DefaultSinceOn, untilOn)
        );
        return this;
    }

    public RoleSeedBuilder AddRoleWithHolder(
        string alias,
        string holdingAlias,
        string name,
        string personAlias,
        params string[] permissionKeys
    ) => AddRole(alias, name, permissionKeys).AddRoleHolding(holdingAlias, alias, personAlias);

    internal sealed record RoleIntent(
        string Alias,
        string Name,
        string Description,
        DateOnly? ArchivedOn,
        IReadOnlyList<string> PermissionKeys
    );

    internal sealed record RoleHoldingIntent(
        string Alias,
        string RoleAlias,
        string PersonAlias,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );
}
