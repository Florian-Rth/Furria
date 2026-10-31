namespace Furria.Application.Studio;

public sealed record ActEveningCommand
{
    public required int ActId { get; init; }

    public required int EventId { get; init; }
}
