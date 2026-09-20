namespace Furria.Application.Club;

public sealed record KeyHoldingVenueSummary
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<KeyHoldingSummary> Holdings { get; init; }
}
