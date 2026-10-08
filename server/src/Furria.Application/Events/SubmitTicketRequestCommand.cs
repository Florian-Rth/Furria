namespace Furria.Application.Events;

public sealed record SubmitTicketRequestCommand
{
    public required int EventId { get; init; }

    public required int TicketCount { get; init; }

    public required string Name { get; init; }

    public required string Phone { get; init; }

    public required string Email { get; init; }

    public required string? Message { get; init; }
}
