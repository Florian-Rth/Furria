using Furria.Core.News;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class NewsPostExpectations
{
    private readonly Expected _expected;
    private readonly int _newsPostId;

    internal NewsPostExpectations(Expected expected, int newsPostId)
    {
        _expected = expected;
        _newsPostId = newsPostId;
    }

    public Expected ToRead(string title, string teaser, string text, NewsCategory? category) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.Equal(title, post.Title);
                Assert.Equal(teaser, post.Teaser);
                Assert.Equal(text, post.Text);
                Assert.Equal(category, post.Category);
            }
        );

    public Expected ToBeTiedTo(int? eventId, int? albumId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.Equal(eventId, post.EventId);
                Assert.Equal(albumId, post.AlbumId);
            }
        );

    public Expected ToHavePendingChanges(string title, string text) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.NotNull(post.PendingSavedAt);
                Assert.Equal(title, post.PendingTitle);
                Assert.Equal(text, post.PendingText);
            }
        );

    public Expected ToShowPicture(int? mediaItemId, string? caption = null) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.Equal(mediaItemId, post.PictureId);
                Assert.Equal(caption, post.PictureCaption);
            }
        );

    public Expected ToHavePendingPicture(int? mediaItemId, string? caption = null) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.NotNull(post.PendingSavedAt);
                Assert.Equal(mediaItemId, post.PendingPictureId);
                Assert.Equal(caption, post.PendingPictureCaption);
            }
        );

    public Expected ToHaveNoPendingChanges() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).PendingSavedAt)
        );

    public Expected ToBeAuthoredBy(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).AuthorPersonId)
        );

    public Expected ToBeLastSavedBy(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).LastSavedByPersonId)
        );

    public Expected ToBeADraft() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.Null(post.PublishedAt);
                Assert.Null(post.Slug);
            }
        );

    public Expected ToBePublished(DateTimeOffset publishedAt, string slug) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var post = await SingleAsync(dbContext, ct);
                Assert.Equal(publishedAt, post.PublishedAt);
                Assert.Equal(slug, post.Slug);
                Assert.Null(post.WithdrawnAt);
            }
        );

    public Expected ToBeWithdrawnAt(DateTimeOffset withdrawnAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(withdrawnAt, (await SingleAsync(dbContext, ct)).WithdrawnAt)
        );

    public Expected ToMention(params NewsMention[] mentions) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var stored = await dbContext
                    .NewsPostMentions.AsNoTracking()
                    .Where(row => row.NewsPostId == _newsPostId)
                    .Select(row =>
                        row.GroupId == null
                            ? new NewsMention(NewsMentionKind.Person, row.PersonId!.Value)
                            : new NewsMention(NewsMentionKind.Group, row.GroupId.Value)
                    )
                    .ToListAsync(ct);
                Assert.Equal(
                    mentions.OrderBy(mention => mention.Kind).ThenBy(mention => mention.TargetId),
                    stored.OrderBy(mention => mention.Kind).ThenBy(mention => mention.TargetId)
                );
            }
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(await dbContext.NewsPosts.AnyAsync(row => row.Id == _newsPostId, ct))
        );

    private Task<NewsPost> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.NewsPosts.AsNoTracking().SingleAsync(row => row.Id == _newsPostId, ct);
}
