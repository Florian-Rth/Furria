namespace Furria.Application.Studio;

public sealed record RestoreEveningChoreographyCommand
{
    public required ActEveningCommand Evening { get; init; }

    public required int Version { get; init; }
}
