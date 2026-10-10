using Furria.Core.News;

namespace Furria.Application.News;

public sealed record NewsPostDetails
{
    public required int NewsPostId { get; init; }

    public required NewsPostState State { get; init; }

    public required string? Slug { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required DateTimeOffset? WithdrawnAt { get; init; }

    public required NewsAuthor? Author { get; init; }

    public required NewsAuthor? LastSavedBy { get; init; }

    public required int Revision { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required NewsPostVersion Content { get; init; }

    public required DateTimeOffset? PendingSavedAt { get; init; }

    public required NewsPostVersion? PendingChanges { get; init; }
}
