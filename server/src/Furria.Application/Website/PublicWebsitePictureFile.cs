using Furria.Application.Media;

namespace Furria.Application.Website;

public sealed record PublicWebsitePictureFile
{
    public required MediaFileDetails File { get; init; }

    public required int MediaItemId { get; init; }

    public required DateTimeOffset RenderedAt { get; init; }
}
