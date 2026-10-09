using Furria.Core.Media;

namespace Furria.Application.Gallery;

public sealed record AlbumItemsQuery
{
    public required int AlbumId { get; init; }

    public required MediaKind? Kind { get; init; }

    public required int? UploaderPersonId { get; init; }
}
