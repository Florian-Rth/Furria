using Furria.Core.Media;

namespace Furria.Application.Media;

public sealed record MediaUrlQuery
{
    public required int MediaItemId { get; init; }

    public required MediaOwner Owner { get; init; }

    public required MediaRendition Rendition { get; init; }

    public required long ExpiresAt { get; init; }

    public required string Signature { get; init; }
}
