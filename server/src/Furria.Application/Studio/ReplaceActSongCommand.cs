namespace Furria.Application.Studio;

public sealed record ReplaceActSongCommand
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }

    public required int MediaItemId { get; init; }

    public required IReadOnlyList<int> WithSongIds { get; init; }
}
