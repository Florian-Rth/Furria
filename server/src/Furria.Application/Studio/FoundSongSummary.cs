namespace Furria.Application.Studio;

public sealed record FoundSongSummary
{
    public required int SongId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}
