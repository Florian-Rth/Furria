namespace Furria.Application.Studio;

public sealed record CreateActStepCommand
{
    public required int ActId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}
