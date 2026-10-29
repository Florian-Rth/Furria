using Furria.Core.Media;

namespace Furria.Application.Studio;

public sealed record StudioFinalTrackDetails
{
    public required int FinalTrackId { get; init; }

    public required int MediaItemId { get; init; }

    public required int Version { get; init; }

    public required bool IsAdopted { get; init; }

    public required MediaItemState State { get; init; }

    public required double? DurationSeconds { get; init; }

    public required StudioAudioUrls Urls { get; init; }
}
