namespace Furria.Application.Website;

public sealed record PageHead
{
    public required string Title { get; init; }

    public required string Description { get; init; }

    public required string CanonicalPath { get; init; }

    public required PageHeadKind Kind { get; init; }

    public required string? ImagePath { get; init; }

    public required string ImageAlt { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }
}
