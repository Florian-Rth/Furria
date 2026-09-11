using Furria.Core.Club;

namespace Furria.Core.Identity;

public sealed class MembershipPause : ITimestamped
{
    public int Id { get; set; }

    public int MembershipId { get; set; }

    public int FirstSessionYear { get; set; }

    public int? LastSessionYear { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Membership? Membership { get; set; }
}
