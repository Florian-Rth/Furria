using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class ChangeoverRoom
{
    public const int Full = 5;

    [Pure]
    public static int CostOf(int auftritteBetween) =>
        auftritteBetween switch
        {
            2 => 4,
            3 => 2,
            4 => 1,
            _ => 0,
        };
}
