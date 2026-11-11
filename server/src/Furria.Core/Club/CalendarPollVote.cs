using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class CalendarPollVote : ITimestamped
{
    public int Id { get; set; }

    public int PollId { get; set; }

    public int PollOptionId { get; set; }

    public int PersonId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarPollOption? PollOption { get; set; }

    public Person? Person { get; set; }
}
