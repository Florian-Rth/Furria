using System.Diagnostics.Contracts;
using System.Net;

namespace Furria.Infrastructure.Mail;

public static class PasswordResetMail
{
    private const string Subject = "Neues Passwort für die Vereins-App";
    private const string FallbackClubName = "Dein Verein";
    private const string LinkLabel = "Neues Passwort festlegen";
    private const string Lead =
        "für deinen Zugang zur Vereins-App wurde gerade ein neues Passwort angefordert. Über diesen Link legst du es fest:";
    private const string Validity =
        "Der Link gilt eine Stunde und lässt sich nur einmal verwenden. Wenn du das nicht warst, ignoriere diese Mail einfach – dein bisheriges Passwort bleibt gültig.";

    [Pure]
    public static OutgoingMail Compose(PasswordResetMailContent content) =>
        new()
        {
            Template = MailTemplate.PasswordReset,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(PasswordResetMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {Lead}

            {content.Link}

            {Validity}

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(PasswordResetMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(Lead)}</p>
            <p><a href="{WebUtility.HtmlEncode(content.Link)}">{LinkLabel}</a></p>
            <p>{WebUtility.HtmlEncode(Validity)}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string ClubNameOf(PasswordResetMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
