namespace Furria.Application.BeerList;

public sealed record BeerTabPotDetails
{
    public required int BeerPotId { get; init; }

    public required bool IsOpen { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required BeerListPerson? Owner { get; init; }

    public required string? PaymentLink { get; init; }

    public required string? PaymentNote { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }

    public required int PaidCrates { get; init; }

    public required int PaidCents { get; init; }

    public required IReadOnlyList<BeerTabCrateSummary> Crates { get; init; }
}
