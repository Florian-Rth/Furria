using Furria.Application.Media;
using Furria.Core.News;

namespace Furria.Application.Start;

public sealed record StartNewsSummary
{
    public required string Slug { get; init; }

    public required string Title { get; init; }

    public required NewsCategory Category { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required PictureDetails? Picture { get; init; }
}
