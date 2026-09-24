namespace Furria.Application.Groups;

public sealed record RunningGroupKind
{
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }
}
