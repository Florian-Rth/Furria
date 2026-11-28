namespace Furria.Application.Studio;

public sealed record ActSongReplacementQuery
{
    public required int ActId { get; init; }

    public required int SongId { get; init; }

    public required int MediaItemId { get; init; }
}
