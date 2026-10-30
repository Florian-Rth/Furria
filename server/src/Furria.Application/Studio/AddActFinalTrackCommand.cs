namespace Furria.Application.Studio;

public sealed record AddActFinalTrackCommand
{
    public required int ActId { get; init; }

    public required int MediaItemId { get; init; }
}
