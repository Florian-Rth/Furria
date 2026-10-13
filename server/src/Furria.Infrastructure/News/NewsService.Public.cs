using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Gallery;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.News;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private const int AlbumStripLength = 8;

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
        var posts = await _publicFace.NewsPosts.Select(PublicPostProjection).ToListAsync(ct);
        var sessionNumbers = await _dbContext.SessionNumbersAsync(ct);

        return PublicSectionsOf(posts, sessionNumbers);
    }

    public async Task<PublicNewsDetails?> GetPublicNewsPostAsync(string slug, CancellationToken ct)
    {
        var article = await _publicFace
            .NewsPosts.Where(post => post.Slug == slug)
            .Select(post => new PublicArticleRow(
                post.Slug!,
                post.Title,
                post.Teaser,
                post.Text,
                post.Category!.Value,
                post.PublishedAt!.Value,
                post.Author == null
                    ? null
                    : new NewsAuthor(post.Author.Id, post.Author.FirstName, post.Author.LastName),
                PublicPictures.Of(
                    PublicPictureKind.NewsPicture,
                    post.PictureId,
                    post.Picture == null ? null : post.Picture.RenderedAt
                ),
                post.PictureCaption,
                post.EventId,
                post.AlbumId
            ))
            .SingleOrDefaultAsync(ct);
        if (article is null)
            return null;

        var mentions = NewsText.Read(article.Text).Mentions;
        return new PublicNewsDetails
        {
            Slug = article.Slug,
            Title = article.Title,
            Teaser = article.Teaser,
            Text = article.Text,
            Category = article.Category,
            PublishedAt = article.PublishedAt,
            Author = article.Author,
            Picture = article.Picture,
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

        var groups = await _publicFace
            .Groups.Where(group => groupIds.Contains(group.Id))
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

        var seats = await RunningBoardSeats
            .InBoardOrder(_publicFace.BoardSeats.Where(seat => personIds.Contains(seat.PersonId)))
            .ToListAsync(ct);

        return PublicPersonsOf(seats);
    }

    private Task<PublicNewsEvent?> ShownEventAsync(int eventId, CancellationToken ct) =>
        _publicFace
            .Events.Where(row => row.CalendarEntryId == eventId)
            .Select(row => new PublicNewsEvent(
                row.CalendarEntryId,
                row.CalendarEntry!.Title,
                row.CalendarEntry.StartsAt,
                row.CalendarEntry.EndsAt,
                row.CalendarEntry.Venue!.Name,
                row.CancelledAt != null,
                PublicEventPictures.Of(
                    row.PictureId,
                    row.Picture == null ? null : row.Picture.RenderedAt,
                    row.Picture == null ? null : row.Picture.Width,
                    row.Picture == null ? null : row.Picture.Height,
                    row.Picture == null ? null : row.Picture.Crop
                )
            ))
            .SingleOrDefaultAsync(ct);

    private async Task<PublicNewsAlbum?> ShownAlbumAsync(int albumId, CancellationToken ct)
    {
        var title = await _publicFace
            .Albums.Where(album => album.Id == albumId)
            .Select(album => album.Title)
            .SingleOrDefaultAsync(ct);
        if (title is null)
            return null;

        var selection = _publicFace.SelectedPhotos.Where(item => item.AlbumId == albumId);
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
                Picture = PublicPictures.PhotoOf(item.Id, item.RenderedAt),
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
            PublicPictures.Of(
                PublicPictureKind.GroupPicture,
                group.PictureId,
                group.PictureRenderedAt
            )
        );

    [Pure]
    private static IReadOnlyList<MentionablePerson> PublicPersonsOf(
        IReadOnlyList<RunningBoardSeat> seats
    ) =>
        [
            .. seats
                .DistinctBy(seat => seat.PersonId)
                .Select(seat => new MentionablePerson(
                    seat.PersonId,
                    seat.FirstName,
                    seat.LastName,
                    seat.OfficeName,
                    PublicPictures.Of(
                        PublicPictureKind.BoardPortrait,
                        seat.PortraitId,
                        seat.PortraitRenderedAt
                    )
                )),
        ];

    [Pure]
    private static IReadOnlyList<PublicNewsSection> PublicSectionsOf(
        IReadOnlyList<PublicPostRow> posts,
        SessionNumbers sessionNumbers
    ) =>
        [
            .. SessionSections
                .DatedOf(
                    posts,
                    post => SessionDate.At(post.PublishedAt),
                    sessionNumbers,
                    section =>
                        section
                            .OrderByDescending(post => post.PublishedAt)
                            .ThenByDescending(post => post.NewsPostId)
                )
                .Select(section => new PublicNewsSection
                {
                    SessionStartYear = section.SessionStartYear,
                    SessionNumber = section.SessionNumber,
                    Posts = [.. section.Items.Select(PublicSummaryOf)],
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
            Picture = PublicPictures.Of(
                PublicPictureKind.NewsPicture,
                post.PictureId,
                post.PictureRenderedAt
            ),
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
        string Slug,
        string Title,
        string Teaser,
        string Text,
        NewsCategory Category,
        DateTimeOffset PublishedAt,
        NewsAuthor? Author,
        PictureDetails? Picture,
        string? PictureCaption,
        int? EventId,
        int? AlbumId
    );
}
