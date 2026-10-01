namespace Furria.Infrastructure.Mail;

public sealed class OutboxMail
{
    public const int AddressLength = 320;
    public const int SubjectLength = 200;

    public long Id { get; set; }

    public MailTemplate Template { get; set; }

    public int PersonId { get; set; }

    public string To { get; set; } = "";

    public string Subject { get; set; } = "";

    public string TextBody { get; set; } = "";

    public string HtmlBody { get; set; } = "";

    public int Attempt { get; set; } = 1;

    public DateTimeOffset? NextAttemptAt { get; set; }
}
