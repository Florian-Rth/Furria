namespace Furria.Application.Registry;

public sealed record PersonBoardSeat
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
