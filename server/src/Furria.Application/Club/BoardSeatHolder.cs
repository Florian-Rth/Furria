namespace Furria.Application.Club;

public sealed record BoardSeatHolder
{
    public required int BoardSeatId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
