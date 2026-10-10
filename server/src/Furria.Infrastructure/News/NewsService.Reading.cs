using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Core.Club;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private static readonly Expression<Func<NewsPost, PostRow>> PostProjection =
        post => new PostRow(
            post.Id,
            post.Title,
            post.Teaser,
            post.Text,
            post.Category,
            post.Event == null
                ? null
                : new NewsEventTie(
                    post.Event.CalendarEntryId,
                    post.Event.CalendarEntry!.Title,
                    post.Event.CalendarEntry.StartsAt,
                    post.Event.CalendarEntry.EndsAt,
                    post.Event.CalendarEntry.Venue == null
                        ? null
                        : post.Event.CalendarEntry.Venue.Name,
                    post.Event.CancelledAt != null
                ),
            post.Album == null
                ? null
                : new AlbumRef(
                    post.Album.Id,
                    post.Album.Title,
                    post.Album.PublishedAt != null && post.Album.BinnedAt == null
                ),
            post.Picture == null
                ? null
                : new MediaPictureRow(
                    post.Picture.Id,
                    post.Picture.State,
                    post.Picture.RenderedAt,
                    post.Picture.Crop
                ),
            post.PictureCaption,
            post.PendingSavedAt,
            post.PendingTitle,
            post.PendingTeaser,
            post.PendingText,
            post.PendingCategory,
            post.PendingEvent == null
                ? null
                : new NewsEventTie(
                    post.PendingEvent.CalendarEntryId,
                    post.PendingEvent.CalendarEntry!.Title,
                    post.PendingEvent.CalendarEntry.StartsAt,
                    post.PendingEvent.CalendarEntry.EndsAt,
                    post.PendingEvent.CalendarEntry.Venue == null
                        ? null
                        : post.PendingEvent.CalendarEntry.Venue.Name,
                    post.PendingEvent.CancelledAt != null
                ),
            post.PendingAlbum == null
                ? null
                : new AlbumRef(
                    post.PendingAlbum.Id,
                    post.PendingAlbum.Title,
                    post.PendingAlbum.PublishedAt != null && post.PendingAlbum.BinnedAt == null
                ),
            post.PendingPicture == null
                ? null
                : new MediaPictureRow(
                    post.PendingPicture.Id,
                    post.PendingPicture.State,
                    post.PendingPicture.RenderedAt,
                    post.PendingPicture.Crop
                ),
            post.PendingPictureCaption,
            post.Author == null
                ? null
                : new NewsAuthor(post.Author.Id, post.Author.FirstName, post.Author.LastName),
            post.LastSavedBy == null
                ? null
                : new NewsAuthor(
                    post.LastSavedBy.Id,
                    post.LastSavedBy.FirstName,
                    post.LastSavedBy.LastName
                ),
            post.Slug,
            post.PublishedAt,
            post.WithdrawnAt,
            post.Revision,
            post.UpdatedAt
        );

    public async Task<NewsPostDetails?> GetAsync(int newsPostId, CancellationToken ct)
    {
        var row = await _dbContext
            .NewsPosts.AsNoTracking()
            .Where(post => post.Id == newsPostId)
            .Select(PostProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return null;

        var albumCards = await AlbumCardsAsync(
            [
                .. new[] { row.Album, row.PendingAlbum }
                    .OfType<AlbumRef>()
                    .Select(album => album.AlbumId),
            ],
            ct
        );
        return DetailsOf(row, albumCards);
    }

    public async Task<IReadOnlyList<NewsSection>> GetHubAsync(CancellationToken ct)
    {
        var rows = await _dbContext.NewsPosts.AsNoTracking().Select(PostProjection).ToListAsync(ct);
        var sessionNumbers = await _dbContext
            .Sessions.AsNoTracking()
            .ToDictionaryAsync(session => session.StartYear, session => session.Number, ct);

        return SectionsOf([.. rows.Select(SummaryOf)], sessionNumbers);
    }

    private NewsPostDetails DetailsOf(
        PostRow row,
        IReadOnlyDictionary<int, AlbumCard> albumCards
    ) =>
        new()
        {
            NewsPostId = row.NewsPostId,
            State = NewsPostStates.Of(row.PublishedAt, row.WithdrawnAt),
            Slug = row.Slug,
            PublishedAt = row.PublishedAt,
            WithdrawnAt = row.WithdrawnAt,
            Author = row.Author,
            LastSavedBy = row.LastSavedBy,
            Revision = row.Revision,
            UpdatedAt = row.UpdatedAt,
            Content = new NewsPostVersion
            {
                Title = row.Title,
                Teaser = row.Teaser,
                Text = row.Text,
                Category = row.Category,
                Event = row.Event,
                Album = TieOf(row.Album, albumCards),
                Picture = PictureOf(row.NewsPostId, row.Picture),
                PictureCaption = row.PictureCaption,
            },
            PendingSavedAt = row.PendingSavedAt,
            PendingChanges = row.PendingSavedAt is null
                ? null
                : new NewsPostVersion
                {
                    Title = row.PendingTitle,
                    Teaser = row.PendingTeaser,
                    Text = row.PendingText,
                    Category = row.PendingCategory,
                    Event = row.PendingEvent,
                    Album = TieOf(row.PendingAlbum, albumCards),
                    Picture = PictureOf(row.NewsPostId, row.PendingPicture),
                    PictureCaption = row.PendingPictureCaption,
                },
        };

    private PictureEditingDetails? PictureOf(int newsPostId, MediaPictureRow? picture) =>
        picture is null ? null : _pictures.EditingOf(MediaOwner.NewsPost(newsPostId), picture);

    private NewsPostSummary SummaryOf(PostRow row)
    {
        var isPending = row.PendingSavedAt is not null;
        var title = isPending ? row.PendingTitle : row.Title;
        var teaser = isPending ? row.PendingTeaser : row.Teaser;
        var category = isPending ? row.PendingCategory : row.Category;
        var picture = isPending ? row.PendingPicture : row.Picture;

        return new()
        {
            NewsPostId = row.NewsPostId,
            Title = title,
            Teaser = teaser,
            Category = category,
            State = NewsPostStates.Of(row.PublishedAt, row.WithdrawnAt),
            HasPendingChanges = isPending,
            Slug = row.Slug,
            PublishedAt = row.PublishedAt,
            WithdrawnAt = row.WithdrawnAt,
            PendingSavedAt = row.PendingSavedAt,
            Picture = picture is null
                ? null
                : _pictures.Of(
                    MediaOwner.NewsPost(row.NewsPostId),
                    picture.MediaItemId,
                    picture.RenderedAt
                ),
            Missing = NewsPublicationRequirements.MissingOf(
                title,
                teaser,
                isPending ? row.PendingText : row.Text,
                category
            ),
            UpdatedAt = row.UpdatedAt,
            Author = row.Author,
        };
    }

    [Pure]
    private static IReadOnlyList<NewsSection> SectionsOf(
        IReadOnlyList<NewsPostSummary> posts,
        IReadOnlyDictionary<int, int?> sessionNumbers
    ) =>
        [
            .. posts
                .GroupBy(post => SessionYearOf(post.PublishedAt))
                .OrderBy(section => section.Key is not null)
                .ThenByDescending(section => section.Key)
                .Select(section => new NewsSection
                {
                    SessionStartYear = section.Key,
                    SessionNumber = section.Key is { } year
                        ? sessionNumbers.GetValueOrDefault(year)
                        : null,
                    Posts =
                    [
                        .. section
                            .OrderByDescending(post => post.PublishedAt)
                            .ThenByDescending(post => post.UpdatedAt)
                            .ThenByDescending(post => post.NewsPostId),
                    ],
                }),
        ];

    [Pure]
    private static int? SessionYearOf(DateTimeOffset? publishedAt) =>
        publishedAt is { } at ? ClubSession.YearOf(ClubClock.DayOf(at)) : null;

    private sealed record PostRow(
        int NewsPostId,
        string Title,
        string Teaser,
        string Text,
        NewsCategory? Category,
        NewsEventTie? Event,
        AlbumRef? Album,
        MediaPictureRow? Picture,
        string? PictureCaption,
        DateTimeOffset? PendingSavedAt,
        string PendingTitle,
        string PendingTeaser,
        string PendingText,
        NewsCategory? PendingCategory,
        NewsEventTie? PendingEvent,
        AlbumRef? PendingAlbum,
        MediaPictureRow? PendingPicture,
        string? PendingPictureCaption,
        NewsAuthor? Author,
        NewsAuthor? LastSavedBy,
        string? Slug,
        DateTimeOffset? PublishedAt,
        DateTimeOffset? WithdrawnAt,
        int Revision,
        DateTimeOffset UpdatedAt
    );
}
