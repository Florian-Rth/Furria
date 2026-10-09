namespace Furria.Application.Media;

public sealed record CompleteMediaJobCommand
{
    public required MediaJobLease Lease { get; init; }

    public required int MediaItemId { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required double? DurationSeconds { get; init; }

    public required DateTimeOffset? CapturedAt { get; init; }

    public required string? Camera { get; init; }

    public MediaCropDetails? AppliedCrop { get; init; }
}
