namespace Furria.Application.Studio;

public sealed record ActSongOrderCommand
{
    public required int ActId { get; init; }

    public required IReadOnlyList<int> SongIds { get; init; }
}
