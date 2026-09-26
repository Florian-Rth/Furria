using System.Diagnostics.Contracts;
using System.Net;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Mail;

public static class CredentialChangeNoticeMail
{
    private const string Subject = "Dein Zugang zur Vereins-App wurde geändert";
    private const string FallbackClubName = "Dein Verein";
    private const string Reassurance = "Wenn du das warst, ist alles in Ordnung.";
    private const string Warning = "Warst du das nicht? Wende dich an den Verein.";

    [Pure]
    public static OutgoingMail Compose(CredentialChangeNoticeMailContent content) =>
        new()
        {
            Template = MailTemplate.CredentialChangeNotice,
            PersonId = content.PersonId,
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string LeadOf(CredentialChange change) =>
        change switch
        {
            CredentialChange.PasswordReset =>
                "Das Passwort deines Zugangs zur Vereins-App wurde gerade über den Link „Passwort vergessen“ neu festgelegt.",
            CredentialChange.PasswordChanged =>
                "Das Passwort deines Zugangs zur Vereins-App wurde gerade geändert.",
            CredentialChange.LoginEmailChanged =>
                "Die E-Mail-Adresse, mit der du dich in der Vereins-App anmeldest, wurde gerade geändert. Diese Adresse gilt dafür nicht mehr.",
            CredentialChange.AccessRecovered =>
                "Dein Zugang zur Vereins-App wurde gerade vor Ort im Verein wiederhergestellt.",
            CredentialChange.PasskeyAdded =>
                "Zu deinem Zugang zur Vereins-App wurde gerade ein neuer Passkey hinzugefügt.",
            CredentialChange.PasskeyRemoved =>
                "Von deinem Zugang zur Vereins-App wurde gerade ein Passkey entfernt. Mit ihm kannst du dich nicht mehr anmelden.",
            _ => throw new ArgumentOutOfRangeException(nameof(change), change, null),
        };

    [Pure]
    private static string TextOf(CredentialChangeNoticeMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {LeadOf(content.Change)}

            {Reassurance} {Warning}

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(CredentialChangeNoticeMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content.Change))}</p>
            <p>{WebUtility.HtmlEncode(Reassurance)} <strong>{WebUtility.HtmlEncode(
                Warning
            )}</strong></p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string ClubNameOf(CredentialChangeNoticeMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
