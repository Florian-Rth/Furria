using System.Diagnostics.Contracts;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Mail;

public sealed class MailOutbox
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public MailOutbox(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public void Stage(OutgoingMail mail) =>
        _dbContext.OutboxMails.Add(ToRow(mail, _timeProvider.GetUtcNow()));

    [Pure]
    private static OutboxMail ToRow(OutgoingMail mail, DateTimeOffset enqueuedAt) =>
        new()
        {
            Template = mail.Template,
            RecipientKind = mail.Recipient.Kind,
            RecipientId = mail.Recipient.Id,
            To = mail.To,
            Subject = mail.Subject,
            TextBody = mail.TextBody,
            HtmlBody = mail.HtmlBody,
            EnqueuedAt = enqueuedAt,
        };
}
