namespace Furria.Core.RunningOrders.Planning;

internal sealed record CompleteOrder(
    IReadOnlyList<LineKey> Keys,
    IReadOnlyList<RunningOrderFinding> Findings,
    PlanFacts Facts
)
{
    public int FindingsOfKind(params FindingKind[] kinds) =>
        Findings.Count(finding => kinds.Contains(finding.Kind));
}
