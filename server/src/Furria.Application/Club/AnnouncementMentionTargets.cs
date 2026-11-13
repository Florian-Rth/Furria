using Furria.Application.Media;
using Furria.Core.Groups;

namespace Furria.Application.Club;

public sealed record AnnouncementMentionTargets
{
    public static readonly AnnouncementMentionTargets None = new()
    {
        Persons = [],
        Groups = [],
        CalendarEntries = [],
        Events = [],
        NewsPosts = [],
        Albums = [],
    };

    public required IReadOnlyList<MentionedPerson> Persons { get; init; }

    public required IReadOnlyList<MentionedGroup> Groups { get; init; }

    public required IReadOnlyList<MentionedCalendarEntry> CalendarEntries { get; init; }

    public required IReadOnlyList<MentionedEvent> Events { get; init; }

    public required IReadOnlyList<MentionedNewsPost> NewsPosts { get; init; }

    public required IReadOnlyList<MentionedAlbum> Albums { get; init; }
}

public sealed record MentionedPerson(
    int PersonId,
    string FirstName,
    string LastName,
    string? OfficeName,
    PictureDetails? Portrait
);

public sealed record MentionedGroup(
    int GroupId,
    string Name,
    string Description,
    GroupTone? Tone,
    PictureDetails? Picture
);

public sealed record MentionedCalendarEntry(
    int CalendarEntryId,
    string Title,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt
);

public sealed record MentionedEvent(
    int EventId,
    string Title,
    DateTimeOffset StartsAt,
    bool IsCancelled
);

public sealed record MentionedNewsPost(
    int NewsPostId,
    string Slug,
    string Title,
    DateTimeOffset PublishedAt
);

public sealed record MentionedAlbum(int AlbumId, string Title);
