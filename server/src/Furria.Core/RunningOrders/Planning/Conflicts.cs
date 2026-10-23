using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class Conflicts
{
    [Pure]
    public static int Of(IReadOnlyList<RunningOrderFinding> findings) =>
        findings.Count(finding => finding.Severity == FindingSeverity.Conflict);
}
