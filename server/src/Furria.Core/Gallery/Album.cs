using Furria.Core.Club;
using Furria.Core.Media;

namespace Furria.Core.Gallery;

public sealed class Album : ITimestamped
{
    public const int TitleLength = 120;
    public const int DescriptionLength = 2000;

    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string? Description { get; set; }

    public int? CalendarEntryId { get; set; }

    public int? SessionStartYear { get; set; }

    public int? CoverMediaItemId { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public DateTimeOffset? BinnedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CalendarEntry? CalendarEntry { get; set; }

    public MediaItem? CoverMediaItem { get; set; }

    public ICollection<MediaItem> Items { get; set; } = [];
}
