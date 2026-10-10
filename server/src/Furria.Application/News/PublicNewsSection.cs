namespace Furria.Application.News;

public sealed record PublicNewsSection
{
    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicNewsSummary> Posts { get; init; }
}
