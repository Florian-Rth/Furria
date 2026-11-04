namespace Furria.Application.BeerList;

public sealed record BeerCrateBooking
{
    public required IReadOnlyList<int> CrateIds { get; init; }

    public required DateTimeOffset UndoableUntil { get; init; }
}
