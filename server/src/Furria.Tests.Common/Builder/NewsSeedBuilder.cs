using Furria.Core.News;

namespace Furria.Tests.Common.Builder;

public sealed class NewsSeedBuilder
{
    private readonly List<NewsPostIntent> _posts = [];

    internal IReadOnlyList<NewsPostIntent> Posts => _posts;

    public NewsSeedBuilder AddNewsPost(
        string alias,
        string title = "",
        string teaser = "",
        string text = "",
        NewsCategory? category = null,
        string? authorAlias = null,
        string? eventAlias = null,
        string? albumAlias = null,
        DateTimeOffset? publishedAt = null,
        string? slug = null,
        DateTimeOffset? withdrawnAt = null,
        DateTimeOffset? updatedAt = null,
        string? lastSavedByAlias = null
    )
    {
        _posts.Add(
            new NewsPostIntent(
                alias,
                new NewsVersionIntent(title, teaser, text, category, eventAlias, albumAlias),
                authorAlias,
                publishedAt,
                slug,
                withdrawnAt,
                updatedAt,
                null,
                lastSavedByAlias
            )
        );
        return this;
    }

    public NewsSeedBuilder AddPendingChanges(
        string postAlias,
        string title = "",
        string teaser = "",
        string text = "",
        NewsCategory? category = null,
        string? eventAlias = null,
        string? albumAlias = null
    )
    {
        var index = _posts.FindIndex(post => post.Alias == postAlias);
        _posts[index] = _posts[index] with
        {
            Pending = new NewsVersionIntent(title, teaser, text, category, eventAlias, albumAlias),
        };
        return this;
    }

    internal sealed record NewsPostIntent(
        string Alias,
        NewsVersionIntent Content,
        string? AuthorAlias,
        DateTimeOffset? PublishedAt,
        string? Slug,
        DateTimeOffset? WithdrawnAt,
        DateTimeOffset? UpdatedAt,
        NewsVersionIntent? Pending,
        string? LastSavedByAlias
    );

    internal sealed record NewsVersionIntent(
        string Title,
        string Teaser,
        string Text,
        NewsCategory? Category,
        string? EventAlias,
        string? AlbumAlias
    );
}
