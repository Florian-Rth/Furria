namespace Furria.Application.BeerList;

public sealed record BeerPotDetails
{
    public required int BeerPotId { get; init; }

    public required BeerListPerson? Owner { get; init; }

    public required int CratePriceCents { get; init; }

    public required string? PaymentLink { get; init; }

    public required string? PaymentNote { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required bool HasStock { get; init; }
}
