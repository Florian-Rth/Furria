using Furria.Core.Groups;

namespace Furria.Core.GroupMatcher;

public sealed class Stance
{
    public const int MinImportance = 1;
    public const int MaxImportance = 3;

    public int GroupId { get; set; }

    public int StatementId { get; set; }

    public StancePosition Position { get; set; }

    public int Importance { get; set; }

    public DateTimeOffset TakenAt { get; set; }

    public Group? Group { get; set; }

    public MatcherStatement? Statement { get; set; }
}
