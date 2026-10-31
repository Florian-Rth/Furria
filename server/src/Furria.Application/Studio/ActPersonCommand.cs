namespace Furria.Application.Studio;

public sealed record ActPersonCommand
{
    public required int ActId { get; init; }

    public required int PersonId { get; init; }
}
