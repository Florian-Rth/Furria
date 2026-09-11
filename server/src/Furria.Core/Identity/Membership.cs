using Furria.Core.Club;

namespace Furria.Core.Identity;

public sealed class Membership : ITimestamped
{
    public int Id { get; set; }

    public int PersonId { get; set; }

    public DateOnly StartedOn { get; set; }

    public DateOnly? EndedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Person { get; set; }

    public ICollection<MembershipPause> Pauses { get; set; } = [];
}
