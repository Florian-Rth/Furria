namespace Furria.Application.Events;

public sealed record EventPresalePlaceSummary
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required bool IsArchived { get; init; }
}
