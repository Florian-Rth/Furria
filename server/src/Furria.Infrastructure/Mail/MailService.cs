using Furria.Application.Mail;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Furria.Infrastructure.Mail;

public sealed class MailService
{
    private readonly MailOptions _options;

    public MailService(IOptions<MailOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(OutgoingMail mail, CancellationToken ct)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.Auto, ct);

        if (_options.User.Length > 0)
            await client.AuthenticateAsync(_options.User, _options.Password, ct);

        await client.SendAsync(ToMessage(mail), ct);
        await client.DisconnectAsync(quit: true, ct);
    }

    private MimeMessage ToMessage(OutgoingMail mail)
    {
        var message = new MimeMessage { Subject = mail.Subject };
        message.From.Add(MailboxAddress.Parse(_options.From));
        message.To.Add(MailboxAddress.Parse(mail.To));
        message.Body = new BodyBuilder
        {
            TextBody = mail.TextBody,
            HtmlBody = mail.HtmlBody,
        }.ToMessageBody();

        return message;
    }
}
