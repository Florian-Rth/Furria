namespace Furria.Infrastructure.Events;

public sealed record RequestedEvent(string Title, DateTimeOffset StartsAt);
