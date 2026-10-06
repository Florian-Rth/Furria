using System.Diagnostics.Contracts;
using System.Net;

namespace Furria.Infrastructure.Mail;

public static class AccessRequestMail
{
    private const string Subject = "Dein Zugang zur Vereins-App";
    private const string FallbackClubName = "Dein Verein";
    private const string LinkLabel = "Zugang einrichten";
    private const string NameSeparator = ", ";
    private const string LastNameSeparator = " und ";
    private const string SingleLead =
        "für diese E-Mail-Adresse wurde gerade ein Zugang zur Vereins-App angefordert. Über diesen Link legst du dein Passwort fest und bist gleich drin:";
    private const string SharedLead =
        "für diese E-Mail-Adresse wurde gerade ein Zugang zur Vereins-App angefordert. Der Verein hat sie für mehrere Personen hinterlegt, deshalb bekommt jede ihren eigenen Link. Wer ihren Link zuerst nutzt, meldet sich mit dieser Adresse an; alle anderen wählen dabei ihre eigene:";
    private const string SingleValidityPrefix = "Der Link gilt";
    private const string SharedValidityPrefix = "Die Links gelten";
    private const string ValiditySuffix =
        "und lässt sich nur einmal verwenden. Wenn du keinen Zugang angefordert hast, ignoriere diese Mail einfach.";
    private const string SharedValiditySuffix =
        "und lassen sich je nur einmal verwenden. Wenn du keinen Zugang angefordert hast, ignoriere diese Mail einfach.";

    [Pure]
    public static OutgoingMail Compose(AccessRequestMailContent content) =>
        new()
        {
            Template = MailTemplate.AccessRequest,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(AccessRequestMailContent content) =>
        $"""
            Hallo {NamesOf(content)},

            {LeadOf(content)}

            {string.Join('\n', content.Links.Select(TextLineOf))}

            {ValidityOf(content)}

            Viele Grüße
            {ClubNameOf(content)}
            """;

    [Pure]
    private static string HtmlOf(AccessRequestMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(NamesOf(content))},</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content))}</p>
            {string.Join('\n', content.Links.Select(HtmlLineOf))}
            <p>{WebUtility.HtmlEncode(ValidityOf(content))}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(ClubNameOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static bool IsShared(AccessRequestMailContent content) => content.Links.Count > 1;

    [Pure]
    private static string LeadOf(AccessRequestMailContent content) =>
        IsShared(content) ? SharedLead : SingleLead;

    [Pure]
    private static string TextLineOf(AccessRequestMailLink link) =>
        $"Für {link.FirstName}: {link.Link}";

    [Pure]
    private static string HtmlLineOf(AccessRequestMailLink link) =>
        $"<p>Für {WebUtility.HtmlEncode(link.FirstName)}: <a href=\"{WebUtility.HtmlEncode(link.Link)}\">{LinkLabel}</a></p>";

    [Pure]
    private static string ValidityOf(AccessRequestMailContent content)
    {
        var until = InvitationMail.GermanDateOf(content.ExpiresAt);

        return IsShared(content)
            ? $"{SharedValidityPrefix} bis zum {until} {SharedValiditySuffix}"
            : $"{SingleValidityPrefix} bis zum {until} {ValiditySuffix}";
    }

    [Pure]
    private static string NamesOf(AccessRequestMailContent content)
    {
        var names = content.Links.Select(link => link.FirstName).ToList();

        return names.Count == 1
            ? names[0]
            : $"{string.Join(NameSeparator, names[..^1])}{LastNameSeparator}{names[^1]}";
    }

    [Pure]
    private static string ClubNameOf(AccessRequestMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
