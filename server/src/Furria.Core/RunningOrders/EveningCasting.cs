using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

public static class EveningCasting
{
    [Pure]
    public static CastChange? ChangeFor(bool inSessionCast, bool dances) =>
        inSessionCast == dances ? null
        : dances ? CastChange.Added
        : CastChange.Removed;
}
