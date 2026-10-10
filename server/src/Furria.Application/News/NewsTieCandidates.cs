using Furria.Application.Media;

namespace Furria.Application.News;

public sealed record NewsTieCandidates
{
    public required IReadOnlyList<NewsEventTie> Events { get; init; }

    public required IReadOnlyList<TieableAlbum> Albums { get; init; }
}

public sealed record TieableAlbum(
    int AlbumId,
    string Title,
    int? SessionStartYear,
    int PhotoCount,
    PictureDetails? Cover
);
