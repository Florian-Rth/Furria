using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record GroupProposalSummary
{
    public required int StatementId { get; init; }

    public required string Text { get; init; }

    public required MatcherStatementStatus Status { get; init; }

    public required DateTimeOffset ProposedAt { get; init; }
}
