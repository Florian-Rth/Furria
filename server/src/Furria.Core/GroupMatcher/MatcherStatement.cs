using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Core.GroupMatcher;

public sealed class MatcherStatement : ITimestamped
{
    public const int MaxTextLength = 160;
    public const int MaxApproved = 10;

    public int Id { get; set; }

    public string Text { get; set; } = "";

    public MatcherStatementStatus Status { get; set; }

    public int? SortOrder { get; set; }

    public int? ProposedByGroupId { get; set; }

    public DateTimeOffset? ApprovedAt { get; set; }

    public DateTimeOffset? RewordedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Group? ProposedByGroup { get; set; }

    public ICollection<Stance> Stances { get; set; } = [];
}
