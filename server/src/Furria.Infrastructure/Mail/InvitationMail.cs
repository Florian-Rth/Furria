using System.Diagnostics.Contracts;
using System.Net;
using Furria.Core.Club;

namespace Furria.Infrastructure.Mail;

public static class InvitationMail
{
    private const string Subject = "Dein Zugang zur Vereins-App";
    private const string FallbackClubName = "Dein Verein";

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
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(InvitationMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {ClubNameOf(
                content
            )} hat dich in die Vereins-App eingeladen. Über diesen Link legst du dein Passwort fest und bist gleich drin:

            {content.Link}

            Der Link gilt bis zum {GermanDateOf(
                content.ExpiresAt
            )} und lässt sich nur einmal verwenden. Wenn du mit dieser Einladung nichts anfangen kannst, ignoriere diese Mail einfach.

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(InvitationMailContent content)
    {
        var link = WebUtility.HtmlEncode(content.Link);

        return $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(
                ClubNameOf(content)
            )} hat dich in die Vereins-App eingeladen. Über diesen Link legst du dein Passwort fest und bist gleich drin:</p>
            <p><a href="{link}">Zugang einrichten</a></p>
            <p>Der Link gilt bis zum {GermanDateOf(
                content.ExpiresAt
            )} und lässt sich nur einmal verwenden. Wenn du mit dieser Einladung nichts anfangen kannst, ignoriere diese Mail einfach.</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;
    }

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
