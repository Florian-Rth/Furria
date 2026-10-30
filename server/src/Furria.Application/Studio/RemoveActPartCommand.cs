namespace Furria.Application.Studio;

public sealed record RemoveActPartCommand
{
    public required int ActId { get; init; }

    public required int PartId { get; init; }
}
