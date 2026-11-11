namespace Furria.Application.GroupMatcher;

public sealed record GroupCoverageSummary
{
    public required MatcherGroupRef Group { get; init; }

    public required bool IsTakingPart { get; init; }

    public required IReadOnlyList<CoverageCell> Cells { get; init; }
}
