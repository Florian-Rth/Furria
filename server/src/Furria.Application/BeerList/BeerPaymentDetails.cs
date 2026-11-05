namespace Furria.Application.BeerList;

public sealed record BeerPaymentDetails
{
    public required int BeerPaymentId { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }
}
