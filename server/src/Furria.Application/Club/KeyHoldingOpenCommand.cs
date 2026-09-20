namespace Furria.Application.Club;

public sealed record KeyHoldingOpenCommand
{
    public required int VenueId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}
