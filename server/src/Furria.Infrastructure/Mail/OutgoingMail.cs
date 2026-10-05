namespace Furria.Infrastructure.Mail;

public sealed record OutgoingMail
{
    public required MailTemplate Template { get; init; }

    public required MailRecipient Recipient { get; init; }

    public required string To { get; init; }

    public required string Subject { get; init; }

    public required string TextBody { get; init; }

    public required string HtmlBody { get; init; }
}
