using Furria.Core.Gallery;

namespace Furria.Application.Gallery;

public sealed record UploadLinkLookupDetails
{
    public required string Title { get; init; }

    public required UploadLinkState State { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
