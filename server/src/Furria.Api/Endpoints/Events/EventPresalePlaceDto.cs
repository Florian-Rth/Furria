using Furria.Application.Events;

namespace Furria.Api.Endpoints.Events;

public sealed record EventPresalePlaceDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required bool IsArchived { get; init; }

    public static EventPresalePlaceDto From(EventPresalePlaceSummary place) =>
        new()
        {
            VenueId = place.VenueId,
            Name = place.Name,
            IsArchived = place.IsArchived,
        };
}
