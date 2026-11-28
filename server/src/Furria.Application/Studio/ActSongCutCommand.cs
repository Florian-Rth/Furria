namespace Furria.Application.Studio;

public sealed record ActSongCutCommand
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}
