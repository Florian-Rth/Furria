using Furria.Api.Media;
using Furria.Application.Club;
using Furria.Core.Groups;

namespace Furria.Api.Mentions;

public sealed record AnnouncementMentionsDto
{
    public required IReadOnlyList<MentionedPersonDto> Persons { get; init; }

    public required IReadOnlyList<MentionedGroupDto> Groups { get; init; }

    public required IReadOnlyList<MentionedCalendarEntryDto> CalendarEntries { get; init; }

    public required IReadOnlyList<MentionedEventDto> Events { get; init; }

    public required IReadOnlyList<MentionedNewsPostDto> NewsPosts { get; init; }

    public required IReadOnlyList<MentionedAlbumDto> Albums { get; init; }

    public static AnnouncementMentionsDto From(AnnouncementMentionTargets targets) =>
        new()
        {
            Persons =
            [
                .. targets.Persons.Select(person => new MentionedPersonDto
                {
                    PersonId = person.PersonId,
                    FirstName = person.FirstName,
                    LastName = person.LastName,
                    OfficeName = person.OfficeName,
                    Portrait = PictureDto.From(person.Portrait),
                }),
            ],
            Groups =
            [
                .. targets.Groups.Select(group => new MentionedGroupDto
                {
                    GroupId = group.GroupId,
                    Name = group.Name,
                    Description = group.Description,
                    Tone = group.Tone,
                    Picture = PictureDto.From(group.Picture),
                }),
            ],
            CalendarEntries =
            [
                .. targets.CalendarEntries.Select(entry => new MentionedCalendarEntryDto
                {
                    CalendarEntryId = entry.CalendarEntryId,
                    Title = entry.Title,
                    StartsAt = entry.StartsAt,
                    EndsAt = entry.EndsAt,
                }),
            ],
            Events =
            [
                .. targets.Events.Select(row => new MentionedEventDto
                {
                    EventId = row.EventId,
                    Title = row.Title,
                    StartsAt = row.StartsAt,
                    IsCancelled = row.IsCancelled,
                }),
            ],
            NewsPosts =
            [
                .. targets.NewsPosts.Select(post => new MentionedNewsPostDto
                {
                    NewsPostId = post.NewsPostId,
                    Slug = post.Slug,
                    Title = post.Title,
                    PublishedAt = post.PublishedAt,
                }),
            ],
            Albums =
            [
                .. targets.Albums.Select(album => new MentionedAlbumDto
                {
                    AlbumId = album.AlbumId,
                    Title = album.Title,
                }),
            ],
        };
}

public sealed record MentionedPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? OfficeName { get; init; }

    public required PictureDto? Portrait { get; init; }
}

public sealed record MentionedGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required GroupTone? Tone { get; init; }

    public required PictureDto? Picture { get; init; }
}

public sealed record MentionedCalendarEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }
}

public sealed record MentionedEventDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required bool IsCancelled { get; init; }
}

public sealed record MentionedNewsPostDto
{
    public required int NewsPostId { get; init; }

    public required string Slug { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }
}

public sealed record MentionedAlbumDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }
}
