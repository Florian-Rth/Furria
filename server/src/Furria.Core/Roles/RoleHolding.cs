using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Core.Roles;

public sealed class RoleHolding : ITimestamped
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public int PersonId { get; set; }

    public DateOnly SinceOn { get; set; }

    public DateOnly? UntilOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Role? Role { get; set; }

    public Person? Person { get; set; }
}
