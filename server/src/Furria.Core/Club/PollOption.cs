namespace Furria.Core.Club;

public sealed class PollOption : ITimestamped
{
    public int Id { get; set; }

    public int PollId { get; set; }

    public int Position { get; set; }

    public string Label { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Poll? Poll { get; set; }

    public ICollection<PollVote> Votes { get; set; } = [];
}
