using Furria.Application.Events;

namespace Furria.Application.News;

public sealed record PublicNewsEvent(
    int EventId,
    string Title,
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    string? VenueName,
    bool IsCancelled,
    PublicEventPicture? Picture
);
