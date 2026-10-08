namespace Furria.Infrastructure.Mail;

public sealed record TicketRequestArrivalMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string FirstName { get; init; }

    public required string GuestName { get; init; }

    public required string EventTitle { get; init; }

    public required DateTimeOffset EventStartsAt { get; init; }

    public required int TicketCount { get; init; }

    public required string? ClubName { get; init; }

    public required string Link { get; init; }
}
