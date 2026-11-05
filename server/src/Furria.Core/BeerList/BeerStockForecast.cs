using System.Diagnostics.Contracts;

namespace Furria.Core.BeerList;

public static class BeerStockForecast
{
    public const int PaceWindowDays = 21;

    [Pure]
    public static DateOnly? ProjectedEmptyOn(
        int stock,
        int cratesTakenInPaceWindow,
        DateOnly today
    ) =>
        cratesTakenInPaceWindow > 0
            ? today.AddDays(stock * PaceWindowDays / cratesTakenInPaceWindow)
            : null;
}
