using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class Casts
{
    [Pure]
    public static bool Share(PlanLine first, PlanLine second) => first.SharesPersonWith(second);

    [Pure]
    public static bool ShareBeyond(PlanLine first, PlanLine second, PlanLine between) =>
        first.SharesPersonMissingFrom(second, between);
}
