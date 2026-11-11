namespace Furria.Application.GroupMatcher;

public sealed record WaitingProposalSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required DateTimeOffset ProposedAt { get; init; }

    public required MatcherGroupRef? ProposedBy { get; init; }
}
