namespace Furria.Application.Events;

public sealed record UpdateEventCommand
{
    public required int EventId { get; init; }

    public required EventFactsCommand Facts { get; init; }
}
