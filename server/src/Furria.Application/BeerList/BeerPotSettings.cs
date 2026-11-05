namespace Furria.Application.BeerList;

public sealed record BeerPotSettings
{
    public required int CratePriceCents { get; init; }

    public required string? PaymentLink { get; init; }
}
