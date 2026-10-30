namespace Furria.Application.Studio;

public sealed record MarkActStepCommand
{
    public required int ActId { get; init; }

    public required double AtSeconds { get; init; }
}
