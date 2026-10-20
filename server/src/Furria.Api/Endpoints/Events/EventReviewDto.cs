using Furria.Application.Events;

namespace Furria.Api.Endpoints.Events;

public sealed record EventReviewDto
{
    public required int PublishedAlbums { get; init; }

    public required int PublishedNews { get; init; }

    public static EventReviewDto From(EventReviewTally tally) =>
        new() { PublishedAlbums = tally.PublishedAlbums, PublishedNews = tally.PublishedNews };
}
