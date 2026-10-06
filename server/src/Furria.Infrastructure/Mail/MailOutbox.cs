using System.Diagnostics.Contracts;
using Furria.Infrastructure.Persistence;

namespace Furria.Infrastructure.Mail;

public sealed class MailOutbox
{
    private readonly AppDbContext _dbContext;

    public MailOutbox(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void Stage(OutgoingMail mail) => _dbContext.OutboxMails.Add(ToRow(mail));

    [Pure]
    private static OutboxMail ToRow(OutgoingMail mail) =>
        new()
        {
            Template = mail.Template,
            RecipientKind = mail.Recipient.Kind,
            RecipientId = mail.Recipient.Id,
            To = mail.To,
            Subject = mail.Subject,
            TextBody = mail.TextBody,
            HtmlBody = mail.HtmlBody,
        };
}
