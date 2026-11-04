namespace Furria.Application.BeerList;

public sealed record BeerStockProjection
{
    public required int PaceWindowDays { get; init; }

    public required int CratesTakenInPaceWindow { get; init; }

    public required DateOnly? ProjectedEmptyOn { get; init; }
}
