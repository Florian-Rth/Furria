using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Core.Groups;

public sealed class GroupMembership : ITimestamped
{
    public int Id { get; set; }

    public int GroupId { get; set; }

    public int PersonId { get; set; }

    public DateOnly JoinedOn { get; set; }

    public DateOnly? LeftOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Group? Group { get; set; }

    public Person? Person { get; set; }
}
