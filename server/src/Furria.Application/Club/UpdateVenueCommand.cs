namespace Furria.Application.Club;

public sealed record UpdateVenueCommand
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }
}
