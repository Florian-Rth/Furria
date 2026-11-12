using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.News;
using Furria.Core.Text;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class AnnouncementMentionTargetsQuery
{
    private const int OfferedEntryPastDays = 14;
    private const int OfferedEntryFutureDays = 365;

    private readonly AppDbContext _dbContext;
    private readonly RunningBoardSeats _runningBoardSeats;
    private readonly MediaPictures _pictures;
    private readonly TimeProvider _timeProvider;

    public AnnouncementMentionTargetsQuery(
        AppDbContext dbContext,
        RunningBoardSeats runningBoardSeats,
        MediaPictures pictures,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _runningBoardSeats = runningBoardSeats;
        _pictures = pictures;
        _timeProvider = timeProvider;
    }

    public async Task<AnnouncementMentionTargets> OfferedToAsync(
        MentionReader reader,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var offeredFrom = now.AddDays(-OfferedEntryPastDays);
        var offeredUntil = now.AddDays(OfferedEntryFutureDays);

        return await TargetsAsync(
            new TargetSources(
                _dbContext.People,
                _dbContext.Groups,
                _dbContext.CalendarEntries.Where(entry =>
                    entry.Event == null
                    && entry.StartsAt >= offeredFrom
                    && entry.StartsAt <= offeredUntil
                ),
                _dbContext.Events.Where(row =>
                    row.CalendarEntry!.StartsAt >= offeredFrom
                    && row.CalendarEntry.StartsAt <= offeredUntil
                ),
                _dbContext.NewsPosts,
                _dbContext.Albums
            ),
            reader,
            ct
        );
    }

    public async Task<IReadOnlyDictionary<int, AnnouncementMentionTargets>> OfAnnouncementsAsync(
        IReadOnlyCollection<int> announcementIds,
        MentionReader reader,
        CancellationToken ct
    )
    {
        var mentions = await _dbContext
            .AnnouncementMentions.AsNoTracking()
            .Where(mention => announcementIds.Contains(mention.AnnouncementId))
            .Select(mention => new MentionRow(
                mention.AnnouncementId,
                mention.Kind,
                mention.TargetId
            ))
            .ToListAsync(ct);

        if (mentions.Count == 0)
            return new Dictionary<int, AnnouncementMentionTargets>();

        var targets = await TargetsAsync(SourcesOf(mentions), reader, ct);

        return mentions
            .GroupBy(mention => mention.AnnouncementId)
            .ToDictionary(group => group.Key, group => TargetsOf([.. group], targets));
    }

    private TargetSources SourcesOf(IReadOnlyList<MentionRow> mentions)
    {
        var personIds = IdsOf(mentions, MentionKind.Person);
        var groupIds = IdsOf(mentions, MentionKind.Group);
        var entryIds = IdsOf(mentions, MentionKind.CalendarEntry);
        var eventIds = IdsOf(mentions, MentionKind.Event);
        var newsPostIds = IdsOf(mentions, MentionKind.NewsPost);
        var albumIds = IdsOf(mentions, MentionKind.Album);

        return new TargetSources(
            personIds.Count == 0
                ? null
                : _dbContext.People.Where(person => personIds.Contains(person.Id)),
            groupIds.Count == 0
                ? null
                : _dbContext.Groups.Where(group => groupIds.Contains(group.Id)),
            entryIds.Count == 0
                ? null
                : _dbContext.CalendarEntries.Where(entry => entryIds.Contains(entry.Id)),
            eventIds.Count == 0
                ? null
                : _dbContext.Events.Where(row => eventIds.Contains(row.CalendarEntryId)),
            newsPostIds.Count == 0
                ? null
                : _dbContext.NewsPosts.Where(post => newsPostIds.Contains(post.Id)),
            albumIds.Count == 0
                ? null
                : _dbContext.Albums.Where(album => albumIds.Contains(album.Id))
        );
    }

    private async Task<AnnouncementMentionTargets> TargetsAsync(
        TargetSources sources,
        MentionReader reader,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var entries = await EntriesAsync(sources.CalendarEntries, ct);
        var events = await EventsAsync(sources.Events, ct);
        var sight = await SightAsync(
            [
                .. entries.Select(entry => entry.CalendarEntryId),
                .. events.Select(row => row.EventId),
            ],
            reader,
            today,
            ct
        );

        return new AnnouncementMentionTargets
        {
            Persons = await PersonsAsync(sources.People, today, ct),
            Groups = await GroupsAsync(sources.Groups, ct),
            CalendarEntries = [.. entries.Where(entry => sight.Contains(entry.CalendarEntryId))],
            Events = [.. events.Where(row => sight.Contains(row.EventId))],
            NewsPosts = await NewsPostsAsync(sources.NewsPosts, ct),
            Albums = await AlbumsAsync(sources.Albums, ct),
        };
    }

    private async Task<HashSet<int>> SightAsync(
        IReadOnlyList<int> calendarEntryIds,
        MentionReader reader,
        DateOnly today,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return [];

        var facts = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(entry => calendarEntryIds.Contains(entry.Id))
            .Select(EntryFactsRows.Projection)
            .ToListAsync(ct);
        var ties = await _dbContext.CalendarTiesOfAsync(reader.PersonId, today, ct);
        var rights = new CalendarRights(HoldsClubRead: true, reader.ManagesClubCalendar);

        return
        [
            .. facts
                .Where(row => ties.Sees(row.ToFacts(), rights))
                .Select(row => row.CalendarEntryId),
        ];
    }

    private async Task<IReadOnlyList<MentionedPerson>> PersonsAsync(
        IQueryable<Person>? people,
        DateOnly today,
        CancellationToken ct
    )
    {
        if (people is null)
            return [];

        var rows = await people
            .AsNoTracking()
            .Where(AffiliationQuery.IsAffiliatedOn(today))
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new PersonRow(
                person.Id,
                person.FirstName,
                person.LastName,
                person.PortraitId,
                person.Portrait == null ? null : person.Portrait.RenderedAt
            ))
            .ToListAsync(ct);

        if (rows.Count == 0)
            return [];

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(today, ct);

        return
        [
            .. rows.Select(row => new MentionedPerson(
                row.PersonId,
                row.FirstName,
                row.LastName,
                officeNames.GetValueOrDefault(row.PersonId),
                _pictures.PortraitOf(row.PersonId, row.PortraitId, row.PortraitRenderedAt)
            )),
        ];
    }

    private async Task<IReadOnlyList<MentionedGroup>> GroupsAsync(
        IQueryable<Group>? groups,
        CancellationToken ct
    )
    {
        if (groups is null)
            return [];

        var rows = await groups
            .AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new GroupRow(
                group.Id,
                group.Name,
                group.Description,
                group.Tone,
                group.PictureId,
                group.Picture == null ? null : group.Picture.RenderedAt
            ))
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => new MentionedGroup(
                row.GroupId,
                row.Name,
                row.Description,
                row.Tone,
                _pictures.GroupPictureOf(row.GroupId, row.PictureId, row.PictureRenderedAt)
            )),
        ];
    }

    private static async Task<IReadOnlyList<MentionedCalendarEntry>> EntriesAsync(
        IQueryable<CalendarEntry>? entries,
        CancellationToken ct
    ) =>
        entries is null
            ? []
            : await entries
                .AsNoTracking()
                .Where(PublishedEvents.IsListedEntry)
                .OrderBy(entry => entry.StartsAt)
                .ThenBy(entry => entry.Id)
                .Select(entry => new MentionedCalendarEntry(
                    entry.Id,
                    entry.Title,
                    entry.StartsAt,
                    entry.EndsAt
                ))
                .ToListAsync(ct);

    private static async Task<IReadOnlyList<MentionedEvent>> EventsAsync(
        IQueryable<Event>? events,
        CancellationToken ct
    ) =>
        events is null
            ? []
            : await events
                .AsNoTracking()
                .Where(PublishedEvents.IsPublished)
                .OrderBy(row => row.CalendarEntry!.StartsAt)
                .ThenBy(row => row.CalendarEntryId)
                .Select(row => new MentionedEvent(
                    row.CalendarEntryId,
                    row.CalendarEntry!.Title,
                    row.CalendarEntry.StartsAt,
                    row.CancelledAt != null
                ))
                .ToListAsync(ct);

    private static async Task<IReadOnlyList<MentionedNewsPost>> NewsPostsAsync(
        IQueryable<NewsPost>? posts,
        CancellationToken ct
    ) =>
        posts is null
            ? []
            : await posts
                .AsNoTracking()
                .Where(post =>
                    post.PublishedAt != null && post.WithdrawnAt == null && post.Slug != null
                )
                .OrderByDescending(post => post.PublishedAt)
                .ThenByDescending(post => post.Id)
                .Select(post => new MentionedNewsPost(
                    post.Id,
                    post.Slug!,
                    post.Title,
                    post.PublishedAt!.Value
                ))
                .ToListAsync(ct);

    private static async Task<IReadOnlyList<MentionedAlbum>> AlbumsAsync(
        IQueryable<Album>? albums,
        CancellationToken ct
    ) =>
        albums is null
            ? []
            : await albums
                .AsNoTracking()
                .Where(album => album.BinnedAt == null)
                .OrderByDescending(album => album.CreatedAt)
                .ThenByDescending(album => album.Id)
                .Select(album => new MentionedAlbum(album.Id, album.Title))
                .ToListAsync(ct);

    [Pure]
    private static List<int> IdsOf(IReadOnlyList<MentionRow> mentions, MentionKind kind) =>
        [.. mentions.Where(mention => mention.Kind == kind).Select(mention => mention.TargetId)];

    [Pure]
    private static AnnouncementMentionTargets TargetsOf(
        IReadOnlyList<MentionRow> mentions,
        AnnouncementMentionTargets targets
    )
    {
        var mentioned = mentions.Select(mention => (mention.Kind, mention.TargetId)).ToHashSet();

        return new AnnouncementMentionTargets
        {
            Persons =
            [
                .. targets.Persons.Where(target =>
                    mentioned.Contains((MentionKind.Person, target.PersonId))
                ),
            ],
            Groups =
            [
                .. targets.Groups.Where(target =>
                    mentioned.Contains((MentionKind.Group, target.GroupId))
                ),
            ],
            CalendarEntries =
            [
                .. targets.CalendarEntries.Where(target =>
                    mentioned.Contains((MentionKind.CalendarEntry, target.CalendarEntryId))
                ),
            ],
            Events =
            [
                .. targets.Events.Where(target =>
                    mentioned.Contains((MentionKind.Event, target.EventId))
                ),
            ],
            NewsPosts =
            [
                .. targets.NewsPosts.Where(target =>
                    mentioned.Contains((MentionKind.NewsPost, target.NewsPostId))
                ),
            ],
            Albums =
            [
                .. targets.Albums.Where(target =>
                    mentioned.Contains((MentionKind.Album, target.AlbumId))
                ),
            ],
        };
    }

    private sealed record TargetSources(
        IQueryable<Person>? People,
        IQueryable<Group>? Groups,
        IQueryable<CalendarEntry>? CalendarEntries,
        IQueryable<Event>? Events,
        IQueryable<NewsPost>? NewsPosts,
        IQueryable<Album>? Albums
    );

    private sealed record MentionRow(int AnnouncementId, MentionKind Kind, int TargetId);

    private sealed record PersonRow(
        int PersonId,
        string FirstName,
        string LastName,
        int? PortraitId,
        DateTimeOffset? PortraitRenderedAt
    );

    private sealed record GroupRow(
        int GroupId,
        string Name,
        string Description,
        GroupTone? Tone,
        int? PictureId,
        DateTimeOffset? PictureRenderedAt
    );
}
