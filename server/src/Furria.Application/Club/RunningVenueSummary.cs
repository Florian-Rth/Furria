namespace Furria.Application.Club;

public sealed record RunningVenueSummary
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }
}
