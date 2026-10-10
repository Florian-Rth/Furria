namespace Furria.Application.News;

public sealed record SaveNewsPostCommand
{
    public required int NewsPostId { get; init; }

    public required int BasedOnRevision { get; init; }

    public required NewsPostContent Content { get; init; }

    public required int? SavedByPersonId { get; init; }
}
