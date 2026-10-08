using System.Diagnostics.Contracts;
using System.Net;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.Mail;

public static partial class TicketRequestArrivalMail
{
    private const string SubjectPrefix = "Neue Kartenanfrage von ";
    private const string FallbackClubName = "Dein Verein";
    private const string LinkLabel = "Kartenanfragen ansehen";
    private const string EventsLinkPath = "/events";
    private const string Reason = "Du bekommst diese Mail, weil du Kartenanfragen bearbeitest.";

    [Pure]
    public static OutgoingMail Compose(TicketRequestArrivalMailContent content) =>
        new()
        {
            Template = MailTemplate.TicketRequestArrival,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = $"{SubjectPrefix}{GuestOf(content)}",
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    public static string LinkOf(string clubAppBaseUrl) =>
        $"{clubAppBaseUrl.TrimEnd('/')}{EventsLinkPath}";

    [Pure]
    private static string TextOf(TicketRequestArrivalMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {LeadOf(content)}

            {content.Link}

            {Reason}

            Viele Grüße
            {SenderOf(content)}
            """;

    [Pure]
    private static string HtmlOf(TicketRequestArrivalMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content))}</p>
            <p><a href="{WebUtility.HtmlEncode(content.Link)}">{LinkLabel}</a></p>
            <p>{WebUtility.HtmlEncode(Reason)}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(SenderOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string LeadOf(TicketRequestArrivalMailContent content) =>
        $"{GuestOf(content)} bittet um {MailTicketCount.Of(content.TicketCount)} für „{content.EventTitle}“ am {MailDay.Of(content.EventStartsAt)}. In der Vereins-App siehst du die Anfrage und kannst sie erledigen:";

    [Pure]
    private static string GuestOf(TicketRequestArrivalMailContent content) =>
        LineBreakingRun().Replace(content.GuestName, " ").Trim();

    [Pure]
    private static string SenderOf(TicketRequestArrivalMailContent content) =>
        content.ClubName ?? FallbackClubName;

    [GeneratedRegex(@"[\s\p{C}]+")]
    private static partial Regex LineBreakingRun();
}
