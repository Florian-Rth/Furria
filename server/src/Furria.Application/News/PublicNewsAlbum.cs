using Furria.Application.Gallery;

namespace Furria.Application.News;

public sealed record PublicNewsAlbum(
    int AlbumId,
    string Title,
    int PhotoCount,
    IReadOnlyList<PublicGalleryPhoto> Photos
);
