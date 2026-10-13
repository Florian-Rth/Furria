namespace Furria.Application.Operations;

public sealed record SystemMediaDetails
{
    public static readonly SystemMediaDetails Unknown = new()
    {
        Counts = [],
        TotalBytes = 0,
        Failed = [],
        FailedInLastDay = 0,
    };

    public required IReadOnlyList<MediaCountSummary> Counts { get; init; }

    public required long TotalBytes { get; init; }

    public required IReadOnlyList<FailedMediaSummary> Failed { get; init; }

    public required int FailedInLastDay { get; init; }
}
