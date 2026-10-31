namespace Furria.Application.Studio;

public sealed record RemoveActSongCommand
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }
}
