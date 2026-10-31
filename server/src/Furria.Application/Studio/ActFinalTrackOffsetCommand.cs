namespace Furria.Application.Studio;

public sealed record ActFinalTrackOffsetCommand
{
    public required int ActId { get; init; }

    public required int FinalTrackId { get; init; }

    public required int SourceMediaItemId { get; init; }

    public required double OffsetSeconds { get; init; }

    public required double Stretch { get; init; }
}
