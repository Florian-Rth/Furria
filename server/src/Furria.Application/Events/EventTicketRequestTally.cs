namespace Furria.Application.Events;

public sealed record EventTicketRequestTally
{
    public required int Open { get; init; }

    public required int Cards { get; init; }

    public required DateTimeOffset? OldestRequestedAt { get; init; }
}
