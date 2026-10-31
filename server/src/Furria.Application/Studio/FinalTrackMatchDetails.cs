namespace Furria.Application.Studio;

public sealed record FinalTrackMatchDetails
{
    public required int SourceMediaItemId { get; init; }

    public required double OffsetSeconds { get; init; }

    public required double Stretch { get; init; }

    public required double Confidence { get; init; }
}
