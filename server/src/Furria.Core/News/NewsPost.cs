using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.Identity;
using Furria.Core.Media;

namespace Furria.Core.News;

public sealed class NewsPost : ITimestamped
{
    public const int TitleLength = 120;
    public const int TeaserLength = 300;
    public const int TextLength = 20_000;
    public const int PictureCaptionLength = 300;

    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string Teaser { get; set; } = "";

    public string Text { get; set; } = "";

    public NewsCategory? Category { get; set; }

    public int? EventId { get; set; }

    public int? AlbumId { get; set; }

    public int? PictureId { get; set; }

    public string? PictureCaption { get; set; }

    public DateTimeOffset? PendingSavedAt { get; set; }

    public string PendingTitle { get; set; } = "";

    public string PendingTeaser { get; set; } = "";

    public string PendingText { get; set; } = "";

    public NewsCategory? PendingCategory { get; set; }

    public int? PendingEventId { get; set; }

    public int? PendingAlbumId { get; set; }

    public int? PendingPictureId { get; set; }

    public string? PendingPictureCaption { get; set; }

    public int? AuthorPersonId { get; set; }

    public int? LastSavedByPersonId { get; set; }

    public string? Slug { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public DateTimeOffset? WithdrawnAt { get; set; }

    public int Revision { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Author { get; set; }

    public Person? LastSavedBy { get; set; }

    public Event? Event { get; set; }

    public Album? Album { get; set; }

    public Event? PendingEvent { get; set; }

    public Album? PendingAlbum { get; set; }

    public MediaItem? Picture { get; set; }

    public MediaItem? PendingPicture { get; set; }

    public ICollection<NewsPostMention> Mentions { get; set; } = [];
}
