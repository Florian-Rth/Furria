namespace Furria.Application.BeerList;

public sealed record BeerJournalCrateSummary
{
    public required int CrateId { get; init; }

    public required BeerListPerson? Person { get; init; }

    public required int PriceCents { get; init; }

    public required DateTimeOffset BookedAt { get; init; }

    public required BeerListPerson? EnteredBy { get; init; }

    public required DateTimeOffset? UndoneAt { get; init; }

    public required int? BeerPaymentId { get; init; }
}
