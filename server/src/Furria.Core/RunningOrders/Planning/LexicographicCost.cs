using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders.Planning;

internal static class LexicographicCost
{
    private const long PrimaryUnit = 1L << 24;

    [Pure]
    public static long Of(int primary, int secondary) => primary * PrimaryUnit + secondary;
}
