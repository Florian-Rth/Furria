using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Media;

namespace Furria.Core.Gallery;

public sealed class UploadLink : ITimestamped
{
    public const int TitleLength = 80;
    public const int SeedLength = 22;
    public const int TokenLength = 43;
    public const int TokenHashLength = 43;
    public const long MaxBytes = 100L * 1024 * 1024 * 1024;

    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(7);

    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string TokenSeed { get; set; } = "";

    public string TokenHash { get; set; } = "";

    public int? CreatedByPersonId { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public int UploadCount { get; set; }

    public long UploadedBytes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? CreatedBy { get; set; }

    public ICollection<MediaItem> InboxItems { get; set; } = [];

    [Pure]
    public static DateTimeOffset ExpiryFor(DateTimeOffset createdAt) => createdAt + Lifetime;

    [Pure]
    public UploadLinkState StateAt(DateTimeOffset now) =>
        RevokedAt is not null ? UploadLinkState.Revoked
        : now >= ExpiresAt ? UploadLinkState.Expired
        : UploadLinkState.Open;
}
