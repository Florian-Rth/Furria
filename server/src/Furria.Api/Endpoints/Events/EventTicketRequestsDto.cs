using Furria.Application.Events;

namespace Furria.Api.Endpoints.Events;

public sealed record EventTicketRequestsDto
{
    public required int Open { get; init; }

    public required int Cards { get; init; }

    public required DateTimeOffset? OldestRequestedAt { get; init; }

    public static EventTicketRequestsDto From(EventTicketRequestTally tally) =>
        new()
        {
            Open = tally.Open,
            Cards = tally.Cards,
            OldestRequestedAt = tally.OldestRequestedAt,
        };
}
