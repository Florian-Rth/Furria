namespace Furria.Application.News;

public sealed record NewsSection
{
    public required int? SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<NewsPostSummary> Posts { get; init; }
}
