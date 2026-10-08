namespace Furria.Infrastructure.Mail;

public sealed record TicketRequestReceiptMailContent
{
    public required int TicketRequestId { get; init; }

    public required string To { get; init; }

    public required string EventTitle { get; init; }

    public required DateTimeOffset EventStartsAt { get; init; }

    public required int TicketCount { get; init; }

    public required string? ClubName { get; init; }
}
