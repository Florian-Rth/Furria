namespace Furria.Application.Registry;

public sealed record GroupReference
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }
}
