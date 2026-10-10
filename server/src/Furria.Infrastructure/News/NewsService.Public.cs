using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Gallery;
using Furria.Application.News;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.News;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private const int AlbumStripLength = 8;

    private static readonly Expression<Func<NewsPost, bool>> IsLive = post =>
        post.PublishedAt != null
        && post.WithdrawnAt == null
        && post.Slug != null
        && post.Category != null;

    private static readonly Expression<Func<NewsPost, PublicPostRow>> PublicPostProjection =
        post => new PublicPostRow(
            post.Id,
            post.Slug!,
            post.Title,
            post.Teaser,
            post.Text,
            post.Category!.Value,
            post.PublishedAt!.Value,
            post.PictureId,
            post.Picture == null ? null : post.Picture.RenderedAt
        );

    public async Task<IReadOnlyList<PublicNewsSection>> GetPublicNewsAsync(CancellationToken ct)
    {
        var posts = await _dbContext
            .NewsPosts.AsNoTracking()
            .Where(IsLive)
            .Select(PublicPostProjection)
            .ToListAsync(ct);
        var sessionNumbers = await _dbContext
            .Sessions.AsNoTracking()
            .ToDictionaryAsync(session => session.StartYear, session => session.Number, ct);

        return PublicSectionsOf(posts, sessionNumbers);
    }

    public async Task<PublicNewsDetails?> GetPublicNewsPostAsync(string slug, CancellationToken ct)
    {
        var post = await _dbContext
            .NewsPosts.AsNoTracking()
            .Where(IsLive)
            .Where(post => post.Slug == slug)
            .Select(PublicPostProjection)
            .SingleOrDefaultAsync(ct);
        if (post is null)
            return null;

        var article = await _dbContext
            .NewsPosts.AsNoTracking()
            .Where(row => row.Id == post.NewsPostId)
            .Select(row => new PublicArticleRow(
                row.Author == null
                    ? null
                    : new NewsAuthor(row.Author.Id, row.Author.FirstName, row.Author.LastName),
                row.PictureCaption,
                row.EventId,
                row.AlbumId
            ))
            .SingleAsync(ct);

        var mentions = NewsText.Read(post.Text).Mentions;
        return new PublicNewsDetails
        {
            Slug = post.Slug,
            Title = post.Title,
            Teaser = post.Teaser,
            Text = post.Text,
            Category = post.Category,
            PublishedAt = post.PublishedAt,
            Author = article.Author,
            Picture = MediaPictures.PublicNewsPictureOf(post.PictureId, post.PictureRenderedAt),
            PictureCaption = article.PictureCaption,
            MentionedGroups = await MentionedGroupsAsync(
                TargetsOf(mentions, NewsMentionKind.Group),
                ct
            ),
            MentionedPersons = await MentionedPersonsAsync(
                TargetsOf(mentions, NewsMentionKind.Person),
                ct
            ),
            Event = article.EventId is { } eventId ? await ShownEventAsync(eventId, ct) : null,
            Album = article.AlbumId is { } albumId ? await ShownAlbumAsync(albumId, ct) : null,
        };
    }

    private async Task<IReadOnlyList<MentionableGroup>> MentionedGroupsAsync(
        List<int> groupIds,
        CancellationToken ct
    )
    {
        if (groupIds.Count == 0)
            return [];

        var groups = await _dbContext
            .Groups.AsNoTracking()
            .Where(PublicGroups.IsShown)
            .Where(group => groupIds.Contains(group.Id))
            .Select(group => new GroupRow(
                group.Id,
                group.Name,
                group.Description,
                group.Tone,
                group.PictureId,
                group.Picture == null ? null : group.Picture.RenderedAt
            ))
            .ToListAsync(ct);

        return [.. groups.OrderBy(group => group.GroupId).Select(PublicMentionableOf)];
    }

    private async Task<IReadOnlyList<MentionablePerson>> MentionedPersonsAsync(
        List<int> personIds,
        CancellationToken ct
    )
    {
        if (personIds.Count == 0)
            return [];

        var seats = await _runningBoardSeats.SeatsAsync(ClubClock.Today(_timeProvider), ct);

        return PublicPersonsOf(seats, personIds);
    }

    private Task<NewsEventTie?> ShownEventAsync(int eventId, CancellationToken ct) =>
        _dbContext
            .Events.AsNoTracking()
            .Where(PublicEvents.IsShownAt(_timeProvider.GetUtcNow()))
            .Where(row => row.CalendarEntryId == eventId)
            .Select(row => new NewsEventTie(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.CalendarEntry.EndsAt,
                row.CalendarEntry.Venue!.Name,
                row.CancelledAt != null
            ))
            .SingleOrDefaultAsync(ct);

    private async Task<PublicNewsAlbum?> ShownAlbumAsync(int albumId, CancellationToken ct)
    {
        var title = await _dbContext
            .Albums.AsNoTracking()
            .Where(PublicGallery.IsPublished)
            .Where(album => album.Id == albumId)
            .Select(album => album.Title)
            .SingleOrDefaultAsync(ct);
        if (title is null)
            return null;

        var selection = _dbContext
            .MediaItems.AsNoTracking()
            .Where(PublicGallery.IsInAPublicSelection)
            .Where(item => item.AlbumId == albumId);
        var photoCount = await selection.CountAsync(ct);
        if (photoCount == 0)
            return null;

        var strip = await selection
            .OrderBy(item => item.SelectionPosition)
            .Take(AlbumStripLength)
            .Select(item => new PublicGalleryPhoto
            {
                MediaItemId = item.Id,
                Width = item.Width ?? 0,
                Height = item.Height ?? 0,
                Caption = item.Caption,
                Picture = MediaPictures.PublicGalleryPhotoOf(item.Id),
            })
            .ToListAsync(ct);

        return new PublicNewsAlbum(albumId, title, photoCount, strip);
    }

    [Pure]
    private static MentionableGroup PublicMentionableOf(GroupRow group) =>
        new(
            group.GroupId,
            group.Name,
            group.Description,
            group.Tone,
            MediaPictures.PublicGroupPictureOf(group.PictureId, group.PictureRenderedAt)
        );

    [Pure]
    private static IReadOnlyList<MentionablePerson> PublicPersonsOf(
        IReadOnlyList<RunningBoardSeat> seats,
        List<int> personIds
    ) =>
        [
            .. seats
                .Where(seat => seat.OfficeIsPublic && personIds.Contains(seat.PersonId))
                .DistinctBy(seat => seat.PersonId)
                .Select(seat => new MentionablePerson(
                    seat.PersonId,
                    seat.FirstName,
                    seat.LastName,
                    seat.OfficeName,
                    MediaPictures.PublicBoardPortraitOf(seat.PortraitId, seat.PortraitRenderedAt)
                )),
        ];

    [Pure]
    private static IReadOnlyList<PublicNewsSection> PublicSectionsOf(
        IReadOnlyList<PublicPostRow> posts,
        IReadOnlyDictionary<int, int?> sessionNumbers
    ) =>
        [
            .. posts
                .GroupBy(post => ClubSession.YearOf(ClubClock.DayOf(post.PublishedAt)))
                .OrderByDescending(section => section.Key)
                .Select(section => new PublicNewsSection
                {
                    SessionStartYear = section.Key,
                    SessionNumber = sessionNumbers.GetValueOrDefault(section.Key),
                    Posts =
                    [
                        .. section
                            .OrderByDescending(post => post.PublishedAt)
                            .ThenByDescending(post => post.NewsPostId)
                            .Select(PublicSummaryOf),
                    ],
                }),
        ];

    [Pure]
    private static PublicNewsSummary PublicSummaryOf(PublicPostRow post) =>
        new()
        {
            Slug = post.Slug,
            Title = post.Title,
            Teaser = post.Teaser,
            Text = post.Text,
            Category = post.Category,
            PublishedAt = post.PublishedAt,
            Picture = MediaPictures.PublicNewsPictureOf(post.PictureId, post.PictureRenderedAt),
        };

    private sealed record PublicPostRow(
        int NewsPostId,
        string Slug,
        string Title,
        string Teaser,
        string Text,
        NewsCategory Category,
        DateTimeOffset PublishedAt,
        int? PictureId,
        DateTimeOffset? PictureRenderedAt
    );

    private sealed record PublicArticleRow(
        NewsAuthor? Author,
        string? PictureCaption,
        int? EventId,
        int? AlbumId
    );
}
