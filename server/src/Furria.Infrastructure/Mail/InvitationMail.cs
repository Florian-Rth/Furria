using System.Diagnostics.Contracts;
using System.Net;
using Furria.Core.Club;

namespace Furria.Infrastructure.Mail;

public static class InvitationMail
{
    private const string Subject = "Dein Zugang zur Vereins-App";
    private const string ReminderSubject = "Erinnerung: Dein Zugang zur Vereins-App";
    private const string FallbackClubName = "Dein Verein";
    private const string InvitationLinkPath = "/invitation#token=";
    private const string ReminderPostscript =
        "Der Link aus der ersten Einladung gilt nicht mehr, nimm bitte diesen.";

    private static readonly IReadOnlyList<string> GermanMonths =
    [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
    ];

    [Pure]
    public static OutgoingMail Compose(InvitationMailContent content) =>
        new()
        {
            Template = MailTemplate.Invitation,
            PersonId = content.PersonId,
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content, InvitationLeadOf(content), null),
            HtmlBody = HtmlOf(content, InvitationLeadOf(content), null),
        };

    [Pure]
    public static OutgoingMail ComposeReminder(InvitationMailContent content) =>
        new()
        {
            Template = MailTemplate.InvitationReminder,
            PersonId = content.PersonId,
            To = content.To,
            Subject = ReminderSubject,
            TextBody = TextOf(content, ReminderLeadOf(content), ReminderPostscript),
            HtmlBody = HtmlOf(content, ReminderLeadOf(content), ReminderPostscript),
        };

    [Pure]
    public static string LinkOf(string clubAppBaseUrl, string token) =>
        $"{clubAppBaseUrl.TrimEnd('/')}{InvitationLinkPath}{token}";

    [Pure]
    private static string InvitationLeadOf(InvitationMailContent content) =>
        $"{ClubNameOf(content)} hat dich in die Vereins-App eingeladen. Über diesen Link legst du dein Passwort fest und bist gleich drin:";

    [Pure]
    private static string ReminderLeadOf(InvitationMailContent content) =>
        $"{ClubNameOf(content)} hat dich vor ein paar Tagen in die Vereins-App eingeladen – falls die Mail untergegangen ist: Über diesen Link legst du dein Passwort fest und bist gleich drin:";

    [Pure]
    private static string TextOf(InvitationMailContent content, string lead, string? postscript) =>
        $"""
            Hallo {content.FirstName},

            {lead}

            {content.Link}

            {ValidityOf(content)}{PostscriptLineOf(postscript)}

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(InvitationMailContent content, string lead, string? postscript)
    {
        var link = WebUtility.HtmlEncode(content.Link);
        var postscriptParagraph = postscript is null
            ? ""
            : $"<p>{WebUtility.HtmlEncode(postscript)}</p>";

        return $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(lead)}</p>
            <p><a href="{link}">Zugang einrichten</a></p>
            <p>{WebUtility.HtmlEncode(ValidityOf(content))}</p>
            {postscriptParagraph}
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;
    }

    [Pure]
    private static string ValidityOf(InvitationMailContent content) =>
        $"Der Link gilt bis zum {GermanDateOf(content.ExpiresAt)} und lässt sich nur einmal verwenden. Wenn du mit dieser Einladung nichts anfangen kannst, ignoriere diese Mail einfach.";

    [Pure]
    private static string PostscriptLineOf(string? postscript) =>
        postscript is null ? "" : $"\n\n{postscript}";

    [Pure]
    private static string ClubNameOf(InvitationMailContent content) =>
        content.ClubName ?? FallbackClubName;

    [Pure]
    private static string GermanDateOf(DateTimeOffset instant)
    {
        var day = ClubClock.DayOf(instant);
        return $"{day.Day}. {GermanMonths[day.Month - 1]} {day.Year}";
    }
}
