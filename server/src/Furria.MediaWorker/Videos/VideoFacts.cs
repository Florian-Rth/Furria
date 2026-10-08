namespace Furria.MediaWorker.Videos;

public sealed record VideoFacts
{
    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string VideoCodec { get; init; }

    public required string? PixelFormat { get; init; }

    public required bool IsHdr { get; init; }

    public required string? AudioCodec { get; init; }

    public required double? DurationSeconds { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required string? Camera { get; init; }
}
