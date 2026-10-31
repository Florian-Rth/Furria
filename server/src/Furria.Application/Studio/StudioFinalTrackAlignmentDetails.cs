namespace Furria.Application.Studio;

public sealed record StudioFinalTrackAlignmentDetails
{
    public required int SourceMediaItemId { get; init; }

    public required double OffsetSeconds { get; init; }

    public required double Stretch { get; init; }
}
