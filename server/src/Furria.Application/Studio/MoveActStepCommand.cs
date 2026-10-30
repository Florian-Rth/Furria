namespace Furria.Application.Studio;

public sealed record MoveActStepCommand
{
    public required int ActId { get; init; }

    public required int StepId { get; init; }

    public required double AtSeconds { get; init; }
}
