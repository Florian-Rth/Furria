using System.Diagnostics.Contracts;

namespace Furria.Core.News;

public enum NewsPublicationRequirement
{
    Category = 1,
    Title = 2,
    Teaser = 3,
    Text = 4,
}

public static class NewsPublicationRequirements
{
    [Pure]
    public static IReadOnlyList<NewsPublicationRequirement> MissingOf(
        string title,
        string teaser,
        string text,
        NewsCategory? category
    ) =>
        [
            .. new (bool IsMissing, NewsPublicationRequirement Requirement)[]
            {
                (category is null, NewsPublicationRequirement.Category),
                (string.IsNullOrWhiteSpace(title), NewsPublicationRequirement.Title),
                (string.IsNullOrWhiteSpace(teaser), NewsPublicationRequirement.Teaser),
                (string.IsNullOrWhiteSpace(text), NewsPublicationRequirement.Text),
            }
                .Where(check => check.IsMissing)
                .Select(check => check.Requirement),
        ];
}
