namespace Furria.Application.GroupMatcher;

public sealed record GroupAttentionSummary
{
    public required MatcherGroupRef Group { get; init; }

    public required int StatementCount { get; init; }
}
