namespace Furria.Core.Identity;

public sealed class Membership
{
    public int Id { get; set; }

    public int PersonId { get; set; }

    public MembershipType Type { get; set; }

    public MembershipStatus Status { get; set; }

    public DateOnly StartedAt { get; set; }

    public DateOnly? EndedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Person { get; set; }
}
