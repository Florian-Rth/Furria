namespace Furria.Core.Events;

public sealed class TicketRequest
{
    public const int NameLength = 80;
    public const int EmailLength = 254;
    public const int PhoneLength = 31;
    public const int MessageLength = 500;
    public const int FewestTickets = 1;
    public const int MostTickets = 10;

    public int Id { get; set; }

    public int EventId { get; set; }

    public int TicketCount { get; set; }

    public string Name { get; set; } = "";

    public string Phone { get; set; } = "";

    public string Email { get; set; } = "";

    public string? Message { get; set; }

    public DateTimeOffset RequestedAt { get; set; }

    public Event? Event { get; set; }
}
