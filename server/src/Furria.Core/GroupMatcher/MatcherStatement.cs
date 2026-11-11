using Furria.Core.Club;

namespace Furria.Core.GroupMatcher;

public sealed class MatcherStatement : ITimestamped
{
    public const int MaxTextLength = 160;
    public const int MaxInPool = 10;

    public int Id { get; set; }

    public string Text { get; set; } = "";

    public int SortOrder { get; set; }

    public DateTimeOffset? RewordedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Stance> Stances { get; set; } = [];
}
