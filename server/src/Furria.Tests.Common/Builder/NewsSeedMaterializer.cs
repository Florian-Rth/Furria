using Furria.Core.News;
using Furria.Infrastructure.Persistence;

namespace Furria.Tests.Common.Builder;

internal static class NewsSeedMaterializer
{
    internal const int SeededRevision = 1;

    internal static async Task<SeededNews> InsertAsync(
        AppDbContext dbContext,
        NewsSeedBuilder recorded,
        NewsSeedReferences references,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var posts = recorded.Posts.ToDictionary(
            intent => intent.Alias,
            intent => NewPost(intent, references, now),
            StringComparer.Ordinal
        );
        dbContext.NewsPosts.AddRange(posts.Values);
        await dbContext.SaveChangesAsync(ct);

        foreach (var intent in recorded.Posts.Where(intent => intent.UpdatedAt is not null))
            posts[intent.Alias].UpdatedAt = intent.UpdatedAt!.Value;
        await dbContext.SaveChangesAsync(ct);

        return new SeededNews(posts.ToDictionary(entry => entry.Key, entry => entry.Value.Id));
    }

    private static NewsPost NewPost(
        NewsSeedBuilder.NewsPostIntent intent,
        NewsSeedReferences references,
        DateTimeOffset now
    )
    {
        var text = references.Resolve(intent.Content.Text);
        var pending = intent.Pending;

        return new NewsPost
        {
            Title = intent.Content.Title,
            Teaser = intent.Content.Teaser,
            Text = text,
            Category = intent.Content.Category,
            EventId = references.EventIdOf(intent.Content.EventAlias),
            AlbumId = references.AlbumIdOf(intent.Content.AlbumAlias),
            PendingSavedAt = pending is null ? null : now,
            PendingTitle = pending?.Title ?? "",
            PendingTeaser = pending?.Teaser ?? "",
            PendingText = pending is null ? "" : references.Resolve(pending.Text),
            PendingCategory = pending?.Category,
            PendingEventId = references.EventIdOf(pending?.EventAlias),
            PendingAlbumId = references.AlbumIdOf(pending?.AlbumAlias),
            AuthorPersonId = references.PersonIdOf(intent.AuthorAlias),
            LastSavedByPersonId = references.PersonIdOf(intent.LastSavedByAlias),
            Slug = intent.PublishedAt is null ? null : intent.Slug ?? NewsSlug.Of(intent.Alias),
            PublishedAt = intent.PublishedAt,
            WithdrawnAt = intent.WithdrawnAt,
            Revision = SeededRevision,
            Mentions = [.. NewsText.Read(text).Mentions.Select(MentionOf)],
        };
    }

    private static NewsPostMention MentionOf(NewsMention mention) =>
        mention.Kind == NewsMentionKind.Group
            ? new NewsPostMention { GroupId = mention.TargetId }
            : new NewsPostMention { PersonId = mention.TargetId };
}
