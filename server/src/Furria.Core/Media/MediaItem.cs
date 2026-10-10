using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.News;

namespace Furria.Core.Media;

public sealed class MediaItem : ITimestamped
{
    public const int OriginalFileNameLength = 255;
    public const int ContentTypeLength = 64;
    public const int CameraLength = 120;
    public const int FailureReasonLength = 500;
    public const int CaptionLength = 300;

    public int Id { get; set; }

    public Guid StorageKey { get; set; }

    public MediaOwnerKind OwnerKind { get; set; }

    public int? OwnerPersonId { get; set; }

    public int? OwnerGroupId { get; set; }

    public int? OwnerNewsPostId { get; set; }

    public MediaKind Kind { get; set; }

    public MediaItemState State { get; set; }

    public string? FailureReason { get; set; }

    public string OriginalFileName { get; set; } = "";

    public string ContentType { get; set; } = "";

    public long ByteSize { get; set; }

    public int? Width { get; set; }

    public int? Height { get; set; }

    public double? DurationSeconds { get; set; }

    public DateTimeOffset? CapturedAt { get; set; }

    public string? Camera { get; set; }

    public MediaCrop? Crop { get; set; }

    public DateTimeOffset? RenderedAt { get; set; }

    public int? UploadedByPersonId { get; set; }

    public DateTimeOffset UploadedAt { get; set; }

    public int? AlbumId { get; set; }

    public DateTimeOffset? PlacedAt { get; set; }

    public DateTimeOffset? BinnedAt { get; set; }

    public int? SelectionPosition { get; set; }

    public string? Caption { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? OwnerPerson { get; set; }

    public Group? OwnerGroup { get; set; }

    public NewsPost? OwnerNewsPost { get; set; }

    public Person? UploadedBy { get; set; }

    public Album? Album { get; set; }
}
