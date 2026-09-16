namespace Furria.Tests.Common.Builder;

public sealed class TestRoles
{
    public AliasRegistry<int> Roles { get; }

    public AliasRegistry<int> RolePermissions { get; }

    public AliasRegistry<int> RoleHoldings { get; }

    internal TestRoles(SeededRoles seeded)
    {
        Roles = new AliasRegistry<int>("Rolle", seeded.RoleIds);
        RolePermissions = new AliasRegistry<int>("Berechtigung", seeded.RolePermissionIds);
        RoleHoldings = new AliasRegistry<int>("Inhaberschaft", seeded.RoleHoldingIds);
    }
}
