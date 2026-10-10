using System.Diagnostics.Contracts;

namespace Furria.Core.News;

public enum NewsPostState
{
    Draft = 1,
    Published = 2,
    Withdrawn = 3,
}

public static class NewsPostStates
{
    [Pure]
    public static NewsPostState Of(DateTimeOffset? publishedAt, DateTimeOffset? withdrawnAt) =>
        publishedAt is null ? NewsPostState.Draft
        : withdrawnAt is null ? NewsPostState.Published
        : NewsPostState.Withdrawn;
}
