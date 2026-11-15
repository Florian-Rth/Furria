namespace Furria.Infrastructure.BeerList;

internal sealed record BeerDrinkRunningLow(string Name, int Crates, DateOnly ProjectedEmptyOn);
