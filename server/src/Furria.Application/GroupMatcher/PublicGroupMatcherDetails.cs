using Furria.Application.Groups;

namespace Furria.Application.GroupMatcher;

public sealed record PublicGroupMatcherDetails
{
    public required IReadOnlyList<PublicGroupSummary> Groups { get; init; }

    public required IReadOnlyList<PublicStatementSummary> Statements { get; init; }

    public required IReadOnlyList<PublicAdmissionAgesSummary> AdmissionAges { get; init; }
}
