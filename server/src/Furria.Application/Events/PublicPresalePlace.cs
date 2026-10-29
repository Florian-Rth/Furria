using Furria.Application.Club;

namespace Furria.Application.Events;

public sealed record PublicPresalePlace
{
    public required string Name { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string? Hint { get; init; }

    public required IReadOnlyList<VenueOpeningSlotDetails> OpeningHours { get; init; }
}
