namespace Furria.Application.GroupMatcher;

public sealed record StatementPoolDetails
{
    public required IReadOnlyList<PoolStatementSummary> Statements { get; init; }

    public required IReadOnlyList<GroupCoverageSummary> Coverage { get; init; }
}
