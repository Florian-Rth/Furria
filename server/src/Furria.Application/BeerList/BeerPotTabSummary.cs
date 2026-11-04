namespace Furria.Application.BeerList;

public sealed record BeerPotTabSummary
{
    public required BeerListPerson Person { get; init; }

    public required bool IsEnrolled { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }

    public required int PaidCrates { get; init; }

    public required int PaidCents { get; init; }

    public required DateTimeOffset? OldestOpenBookedAt { get; init; }

    public required IReadOnlyList<BeerPaymentSummary> Payments { get; init; }
}
