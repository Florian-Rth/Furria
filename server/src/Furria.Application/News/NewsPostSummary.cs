using Furria.Application.Media;
using Furria.Core.News;

namespace Furria.Application.News;

public sealed record NewsPostSummary
{
    public required int NewsPostId { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required NewsCategory? Category { get; init; }

    public required NewsPostState State { get; init; }

    public required bool HasPendingChanges { get; init; }

    public required string? Slug { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required DateTimeOffset? WithdrawnAt { get; init; }

    public required DateTimeOffset? PendingSavedAt { get; init; }

    public required PictureDetails? Picture { get; init; }

    public required IReadOnlyList<NewsPublicationRequirement> Missing { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required NewsAuthor? Author { get; init; }
}
