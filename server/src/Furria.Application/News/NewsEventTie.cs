namespace Furria.Application.News;

public sealed record NewsEventTie(
    int EventId,
    string Title,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    string? VenueName,
    bool IsCancelled
);
