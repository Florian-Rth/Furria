namespace Furria.Application.Club;

public sealed record KeyHoldingEndCommand
{
    public required int KeyHoldingId { get; init; }

    public required DateOnly UntilOn { get; init; }
}
