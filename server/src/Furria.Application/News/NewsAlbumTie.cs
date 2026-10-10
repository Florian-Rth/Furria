using Furria.Application.Media;

namespace Furria.Application.News;

public sealed record NewsAlbumTie(
    int AlbumId,
    string Title,
    bool IsPublished,
    int PhotoCount,
    PictureDetails? Cover
);
