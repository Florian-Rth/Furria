using System.Diagnostics.Contracts;

namespace Furria.Core.RunningOrders;

internal static class EveningSections
{
    [Pure]
    public static int FirstHalfLength(int count) => (count + 1) / 2;

    [Pure]
    public static int ThirdLength(int count) => (count + 2) / 3;

    [Pure]
    public static bool IsInFirstHalf(int index, int count) => index < FirstHalfLength(count);

    [Pure]
    public static bool IsEarly(int index, int count) => index < ThirdLength(count);

    [Pure]
    public static bool IsLate(int index, int count) => index >= count - ThirdLength(count);
}
