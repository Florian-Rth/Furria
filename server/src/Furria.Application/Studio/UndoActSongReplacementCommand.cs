namespace Furria.Application.Studio;

public sealed record UndoActSongReplacementCommand
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }
}
