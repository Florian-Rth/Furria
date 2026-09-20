using Furria.Core.Identity;

namespace Furria.Core.Club;

public sealed class Announcement : ITimestamped
{
    public int Id { get; set; }

    public int AuthorPersonId { get; set; }

    public string Title { get; set; } = "";

    public string Body { get; set; } = "";

    public DateTimeOffset PublishedAt { get; set; }

    public DateOnly? ValidUntil { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Person? Author { get; set; }
}
