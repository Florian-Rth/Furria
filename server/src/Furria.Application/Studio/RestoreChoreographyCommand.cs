namespace Furria.Application.Studio;

public sealed record RestoreChoreographyCommand
{
    public required int ActId { get; init; }

    public required int Version { get; init; }
}
