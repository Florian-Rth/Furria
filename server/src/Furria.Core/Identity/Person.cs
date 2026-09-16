using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;

namespace Furria.Core.Identity;

public sealed class Person : ITimestamped
{
    public int Id { get; set; }

    public string FirstName { get; set; } = "";

    public string LastName { get; set; } = "";

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Street { get; set; }

    public string? Zip { get; set; }

    public string? City { get; set; }

    public DateOnly? BirthDate { get; set; }

    public bool ContactVisibleToMembers { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Membership> Memberships { get; set; } = [];

    public ICollection<FeeReduction> FeeReductions { get; set; } = [];

    public ICollection<GroupMembership> GroupMemberships { get; set; } = [];

    public ICollection<GroupAdmin> GroupAdminships { get; set; } = [];

    public ICollection<RoleHolding> RoleHoldings { get; set; } = [];
}
