namespace Furria.Api.Authorization;

public sealed record AnyPermissionRequirement
{
    public required IReadOnlyList<string> PermissionKeys { get; init; }
}
