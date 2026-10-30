namespace Furria.Application.Studio;

public sealed record RemoveActStepCommand
{
    public required int ActId { get; init; }

    public required int StepId { get; init; }
}
