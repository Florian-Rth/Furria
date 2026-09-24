namespace Furria.Tests.Common.Builder;

public sealed class TestRoles
{
    public AliasRegistry<int> Roles { get; }

    public AliasRegistry<int> RolePermissions { get; }

    public AliasRegistry<int> RoleHoldings { get; }

    internal TestRoles(SeededRoles seeded)
    {
        Roles = new AliasRegistry<int>("Role", seeded.RoleIds);
        RolePermissions = new AliasRegistry<int>("RolePermission", seeded.RolePermissionIds);
        RoleHoldings = new AliasRegistry<int>("RoleHolding", seeded.RoleHoldingIds);
    }
}
