namespace Furria.Application.News;

public sealed record CreateNewsPostCommand
{
    public required int? AuthorPersonId { get; init; }

    public required NewsPostContent Content { get; init; }
}
