namespace Furria.Application.Studio;

public sealed record SplitActSongCommand
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }

    public required double AtSeconds { get; init; }
}
