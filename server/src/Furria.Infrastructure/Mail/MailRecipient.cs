namespace Furria.Infrastructure.Mail;

public sealed record MailRecipient
{
    public required MailRecipientKind Kind { get; init; }

    public required int Id { get; init; }

    public static MailRecipient Person(int personId) =>
        new() { Kind = MailRecipientKind.Person, Id = personId };

    public static MailRecipient MembershipApplication(int membershipApplicationId) =>
        new() { Kind = MailRecipientKind.MembershipApplication, Id = membershipApplicationId };

    public static MailRecipient TicketRequest(int ticketRequestId) =>
        new() { Kind = MailRecipientKind.TicketRequest, Id = ticketRequestId };
}
