namespace Furria.Application.Gallery;

public sealed record AlbumSelectionCommand
{
    public required int AlbumId { get; init; }

    public required IReadOnlyList<AlbumSelectionEntry> Entries { get; init; }
}
