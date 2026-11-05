namespace Furria.Application.BeerList;

public sealed record BeerJournalDetails
{
    public required IReadOnlyList<BeerJournalCrateSummary> Crates { get; init; }

    public required IReadOnlyList<BeerJournalPaymentSummary> Payments { get; init; }
}
