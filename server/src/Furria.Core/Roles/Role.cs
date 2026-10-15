using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Core.Roles;

public sealed class Role : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Description { get; set; } = "";

    public ClubIcon? Icon { get; set; }

    public GroupTone? Tone { get; set; }

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<RolePermission> Permissions { get; set; } = [];

    public ICollection<RoleHolding> Holdings { get; set; } = [];
}
