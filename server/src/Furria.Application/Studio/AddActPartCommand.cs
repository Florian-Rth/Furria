namespace Furria.Application.Studio;

public sealed record AddActPartCommand
{
    public required int ActId { get; init; }

    public required int FirstStepId { get; init; }

    public required int LastStepId { get; init; }

    public required string Name { get; init; }
}
