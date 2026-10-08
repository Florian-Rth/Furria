namespace Furria.MediaWorker.Renditions;

public sealed record RenderedMedia
{
    public required int Width { get; init; }

    public required int Height { get; init; }

    public double? DurationSeconds { get; init; }

    public DateTimeOffset? CapturedAt { get; init; }

    public string? Camera { get; init; }
}
