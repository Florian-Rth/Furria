using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public static class RunningOrderRuleKinds
{
    public static readonly IReadOnlySet<RunningOrderRuleKind> ActWishKinds =
        new HashSet<RunningOrderRuleKind>
        {
            RunningOrderRuleKind.First,
            RunningOrderRuleKind.Last,
            RunningOrderRuleKind.FirstHalf,
            RunningOrderRuleKind.SecondHalf,
            RunningOrderRuleKind.Early,
            RunningOrderRuleKind.Late,
        };

    [Pure]
    public static bool IsAboutOneAct(RunningOrderRuleKind kind) => ActWishKinds.Contains(kind);

    [Pure]
    public static bool IsAboutTwoActs(RunningOrderRuleKind kind) =>
        kind
            is RunningOrderRuleKind.Before
                or RunningOrderRuleKind.After
                or RunningOrderRuleKind.Apart;
}
