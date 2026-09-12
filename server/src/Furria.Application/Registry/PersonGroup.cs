namespace Furria.Application.Registry;

public sealed record PersonGroup
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }
}
