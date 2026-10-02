namespace Furria.Application.Start;

public sealed record StartVenue
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Hint { get; init; }
}
