namespace Furria.Application.Studio;

public sealed record ActStepTextCommand
{
    public required int ActId { get; init; }

    public required int StepId { get; init; }

    public required string Name { get; init; }

    public required string? Description { get; init; }
}
