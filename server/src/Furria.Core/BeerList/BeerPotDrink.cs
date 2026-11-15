namespace Furria.Core.BeerList;

public sealed class BeerPotDrink
{
    public const int MaxCratePriceCents = 10_000;

    public int Id { get; set; }

    public int BeerPotId { get; set; }

    public int BeerDrinkId { get; set; }

    public int CratePriceCents { get; set; }

    public bool IsDefault { get; set; }

    public DateTimeOffset? RetiredAt { get; set; }

    public DateTimeOffset? StockWarningSentAt { get; set; }

    public BeerPot? Pot { get; set; }

    public BeerDrink? Drink { get; set; }
}
