namespace Furria.Application.Halls;

public sealed record HallSummary
{
    public required int HallId { get; init; }

    public required int VenueId { get; init; }

    public required string VenueName { get; init; }

    public required string Name { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }
}
