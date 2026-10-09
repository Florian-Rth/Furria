namespace Furria.Application.Gallery;

public sealed record AlbumZipDetails
{
    public required string Title { get; init; }

    public required IReadOnlyList<AlbumZipEntry> Entries { get; init; }
}
