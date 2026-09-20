namespace Furria.Application.Club;

public sealed record BoardSeatEndCommand
{
    public required int BoardOfficeId { get; init; }

    public required int BoardSeatId { get; init; }

    public required DateOnly EndedOn { get; init; }
}
