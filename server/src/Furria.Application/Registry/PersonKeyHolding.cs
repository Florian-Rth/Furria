namespace Furria.Application.Registry;

public sealed record PersonKeyHolding
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
