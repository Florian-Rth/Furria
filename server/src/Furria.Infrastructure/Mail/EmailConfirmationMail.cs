using System.Diagnostics.Contracts;
using System.Globalization;
using System.Net;

namespace Furria.Infrastructure.Mail;

public static class EmailConfirmationMail
{
    private const string Subject = "Dein Bestätigungscode";
    private const string FallbackClubName = "Dein Verein";

    [Pure]
    public static OutgoingMail Compose(EmailConfirmationMailContent content) =>
        new()
        {
            Template = MailTemplate.EmailConfirmation,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(EmailConfirmationMailContent content) =>
        $"""
            Hallo {content.FirstName},

            mit diesem Code bestätigst du, dass diese E-Mail-Adresse dir gehört:

            {content.Code}

            Gib ihn in der Vereins-App ein. Er gilt {MinutesOf(
                content
            )} Minuten. Wenn du das nicht warst, ignoriere diese Mail einfach.

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(EmailConfirmationMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>mit diesem Code bestätigst du, dass diese E-Mail-Adresse dir gehört:</p>
            <p style="font-size: 1.75em; font-weight: bold; letter-spacing: 0.2em;">{WebUtility.HtmlEncode(
                content.Code
            )}</p>
            <p>Gib ihn in der Vereins-App ein. Er gilt {MinutesOf(
                content
            )} Minuten. Wenn du das nicht warst, ignoriere diese Mail einfach.</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string MinutesOf(EmailConfirmationMailContent content) =>
        ((int)content.Lifetime.TotalMinutes).ToString(CultureInfo.InvariantCulture);

    [Pure]
    private static string ClubNameOf(EmailConfirmationMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
