using System.Diagnostics.Contracts;

namespace Furria.Core.BeerList;

public static class BeerStockCorrectionReasons
{
    [Pure]
    public static bool Fits(this BeerStockCorrectionReason reason, int crates) =>
        reason switch
        {
            BeerStockCorrectionReason.Miscount => crates != 0,
            _ => crates < 0,
        };
}
