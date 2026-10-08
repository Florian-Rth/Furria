using System.Diagnostics.Contracts;
using System.Net;

namespace Furria.Infrastructure.Mail;

public static class TicketRequestReceiptMail
{
    private const string Subject = "Deine Kartenanfrage ist beim Verein";
    private const string FallbackClubName = "Dein Verein";
    private const string Disclaimer =
        "Wenn du keine Kartenanfrage gestellt hast, ignoriere diese Mail einfach.";

    [Pure]
    public static OutgoingMail Compose(TicketRequestReceiptMailContent content) =>
        new()
        {
            Template = MailTemplate.TicketRequestReceipt,
            Recipient = MailRecipient.TicketRequest(content.TicketRequestId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(TicketRequestReceiptMailContent content) =>
        $"""
            Hallo,

            {LeadOf(content)}

            {Disclaimer}

            Viele Grüße
            {SenderOf(content)}
            """;

    [Pure]
    private static string HtmlOf(TicketRequestReceiptMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo,</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content))}</p>
            <p>{WebUtility.HtmlEncode(Disclaimer)}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(SenderOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string LeadOf(TicketRequestReceiptMailContent content) =>
        $"deine Kartenanfrage für „{content.EventTitle}“ am {MailDay.Of(content.EventStartsAt)} – {MailTicketCount.Of(content.TicketCount)} – ist beim Verein. Wir melden uns bei dir.";

    [Pure]
    private static string SenderOf(TicketRequestReceiptMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
