namespace Furria.Application.Club;

public sealed record BoardSeatOpenCommand
{
    public required int BoardOfficeId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}
