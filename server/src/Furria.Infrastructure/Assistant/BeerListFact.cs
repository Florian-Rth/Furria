namespace Furria.Infrastructure.Assistant;

public sealed record BeerListFact(
    IReadOnlyList<BeerDrinkFact>? Drinks,
    int OpenCrates,
    decimal OpenEuros,
    IReadOnlyList<BeerTabFact> OpenTabs
);
