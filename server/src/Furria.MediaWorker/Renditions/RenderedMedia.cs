using Furria.Application.Media;

namespace Furria.MediaWorker.Renditions;

public sealed record RenderedMedia
{
    public int? Width { get; init; }

    public int? Height { get; init; }

    public double? DurationSeconds { get; init; }

    public DateTimeOffset? CapturedAt { get; init; }

    public string? Camera { get; init; }

    public MediaCropDetails? AppliedCrop { get; init; }

    public MediaAudioFactsDetails? Audio { get; init; }
}
