namespace Furria.Application.GroupMatcher;

public sealed record StatementPoolDetails
{
    public required IReadOnlyList<ApprovedStatementSummary> Statements { get; init; }

    public required IReadOnlyList<WaitingProposalSummary> Proposals { get; init; }

    public required IReadOnlyList<GroupCoverageSummary> Coverage { get; init; }
}
