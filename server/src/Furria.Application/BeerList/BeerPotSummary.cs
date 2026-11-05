namespace Furria.Application.BeerList;

public sealed record BeerPotSummary
{
    public required int BeerPotId { get; init; }

    public required BeerListPerson? Owner { get; init; }

    public required int CratePriceCents { get; init; }

    public required DateTimeOffset OpenedAt { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required int OpenTabs { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }
}
