using Furria.Core.Halls;

namespace Furria.Application.Halls;

public sealed record HallDetails
{
    public required int HallId { get; init; }

    public required int VenueId { get; init; }

    public required string VenueName { get; init; }

    public required string Name { get; init; }

    public required HallDocument Document { get; init; }

    public required int Version { get; init; }
}
