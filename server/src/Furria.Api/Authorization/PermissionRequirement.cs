namespace Furria.Api.Authorization;

public sealed record PermissionRequirement
{
    public required string PermissionKey { get; init; }
}
