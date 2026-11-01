using Furria.Core.Gallery;

namespace Furria.Application.Gallery;

public sealed record UploadLinkSummary
{
    public required int UploadLinkId { get; init; }

    public required string Title { get; init; }

    public required UploadLinkState State { get; init; }

    public required string? Token { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required DateTimeOffset? RevokedAt { get; init; }

    public required GalleryUploader? CreatedBy { get; init; }

    public required int UploadCount { get; init; }

    public required int InboxPhotos { get; init; }

    public required int InboxVideos { get; init; }
}
