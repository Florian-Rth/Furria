namespace Furria.Application.Start;

public sealed record StartBeerTabSummary
{
    public required int BeerPotId { get; init; }

    public required bool PotIsOpen { get; init; }

    public required int OpenCrates { get; init; }

    public required int OpenCents { get; init; }

    public required DateTimeOffset OldestOpenBookedAt { get; init; }

    public required StartPersonRef? Owner { get; init; }

    public required string? PaymentLink { get; init; }

    public required string? PaymentNote { get; init; }
}
