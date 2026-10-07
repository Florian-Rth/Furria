using System.Diagnostics.Contracts;
using System.Net;

namespace Furria.Infrastructure.Mail;

public static class PersonErasureNoticeMail
{
    private const string Subject = "Deine Daten wurden vom Verein gelöscht";
    private const string FallbackClubName = "Dein Verein";
    private const string UnnamedClub = "Der Verein";
    private const string ErasedWhat =
        "hat deine Daten gelöscht – alles, was der Verein über dich festgehalten hat, auch deinen Zugang zur Vereins-App. Anmelden kannst du dich nicht mehr.";
    private const string ContactLead = "Fragen dazu? So erreichst du den Verein:";
    private const string ContactlessLead = "Fragen dazu? Wende dich an den Verein.";
    private const string AddressSeparator = ", ";
    private const string TextLineBreak = "\n";
    private const string HtmlLineBreak = "<br>";

    [Pure]
    public static OutgoingMail Compose(PersonErasureNoticeMailContent content) =>
        new()
        {
            Template = MailTemplate.PersonErasureNotice,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    private static string TextOf(PersonErasureNoticeMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {LeadOf(content)}

            {string.Join(TextLineBreak, ContactLinesOf(content))}

            Viele Grüße
            {SenderOf(content)}
            """;

    [Pure]
    private static string HtmlOf(PersonErasureNoticeMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content))}</p>
            <p>{string.Join(
                HtmlLineBreak,
                ContactLinesOf(content).Select(WebUtility.HtmlEncode)
            )}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(SenderOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string LeadOf(PersonErasureNoticeMailContent content) =>
        $"{content.ClubName ?? UnnamedClub} {ErasedWhat}";

    [Pure]
    private static IReadOnlyList<string> ContactLinesOf(PersonErasureNoticeMailContent content)
    {
        var ways = Given(content.ClubEmail, content.ClubPhone, AddressOf(content));

        return ways.Length == 0 ? [ContactlessLead] : [ContactLead, .. ways];
    }

    [Pure]
    private static string? AddressOf(PersonErasureNoticeMailContent content)
    {
        var parts = Given(
            content.ClubStreet,
            string.Join(' ', Given(content.ClubZip, content.ClubCity))
        );

        return parts.Length == 0 ? null : string.Join(AddressSeparator, parts);
    }

    [Pure]
    private static string[] Given(params string?[] values) =>
        [.. values.OfType<string>().Where(value => !string.IsNullOrWhiteSpace(value))];

    [Pure]
    private static string SenderOf(PersonErasureNoticeMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
