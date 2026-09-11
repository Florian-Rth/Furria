using Furria.Core.Club;

namespace Furria.Core.Roles;

public sealed class Role : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Description { get; set; } = "";

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<RolePermission> Permissions { get; set; } = [];

    public ICollection<RoleHolding> Holdings { get; set; } = [];
}
