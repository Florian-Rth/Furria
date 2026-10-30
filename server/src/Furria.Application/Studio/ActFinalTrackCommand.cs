namespace Furria.Application.Studio;

public sealed record ActFinalTrackCommand
{
    public required int ActId { get; init; }

    public required int FinalTrackId { get; init; }
}
