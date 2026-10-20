namespace Furria.Application.Events;

public sealed record EventReviewTally
{
    public required int PublishedAlbums { get; init; }

    public required int PublishedNews { get; init; }
}
