namespace Furria.Tests.Common.Builder;

public sealed record SeededRoles(
    IReadOnlyDictionary<string, int> RoleIds,
    IReadOnlyDictionary<string, int> RolePermissionIds,
    IReadOnlyDictionary<string, int> RoleHoldingIds
);
