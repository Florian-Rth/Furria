namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaOutgoingEvent
{
    public required string ChatId { get; init; }

    public required string Name { get; init; }

    public string? Description { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public DateTimeOffset? EndsAt { get; init; }

    public string? Place { get; init; }

    public string? ReplyTo { get; init; }
}
