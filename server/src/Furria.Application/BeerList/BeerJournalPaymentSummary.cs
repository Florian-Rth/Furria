namespace Furria.Application.BeerList;

public sealed record BeerJournalPaymentSummary
{
    public required int BeerPaymentId { get; init; }

    public required BeerListPerson? Person { get; init; }

    public required int Crates { get; init; }

    public required int AmountCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerListPerson? BookedBy { get; init; }

    public required DateTimeOffset? UndoneAt { get; init; }
}
