using Furria.Core.GroupMatcher;

namespace Furria.Application.GroupMatcher;

public sealed record GroupMatcherPageDetails
{
    public required bool IsTakingPart { get; init; }

    public required IReadOnlyList<GroupStatementSummary> Statements { get; init; }

    public required IReadOnlyList<AdmissionAgeBand> AdmissionAges { get; init; }

    public required IReadOnlyList<GroupProposalSummary> Proposals { get; init; }
}
