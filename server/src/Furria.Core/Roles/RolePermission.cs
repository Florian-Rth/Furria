using Furria.Core.Club;

namespace Furria.Core.Roles;

public sealed class RolePermission : ITimestamped
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string PermissionKey { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Role? Role { get; set; }
}
