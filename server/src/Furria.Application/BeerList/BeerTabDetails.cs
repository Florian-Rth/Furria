namespace Furria.Application.BeerList;

public sealed record BeerTabDetails
{
    public required IReadOnlyList<BeerTabPotDetails> Pots { get; init; }
}
