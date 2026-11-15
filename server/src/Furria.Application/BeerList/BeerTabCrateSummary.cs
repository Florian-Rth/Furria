namespace Furria.Application.BeerList;

public sealed record BeerTabCrateSummary
{
    public required int CrateId { get; init; }

    public required int BeerDrinkId { get; init; }

    public required string DrinkName { get; init; }

    public required int PriceCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerListPerson? EnteredBy { get; init; }

    public required DateTimeOffset? PaidAt { get; init; }
}
