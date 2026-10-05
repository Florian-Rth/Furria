using System.Diagnostics.Contracts;
using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;

namespace Furria.Infrastructure.Mail;

public static partial class MembershipApplicationArrivalMail
{
    private const string SubjectPrefix = "Neuer Beitrittsantrag von ";
    private const string FallbackClubName = "Dein Verein";
    private const string LinkLabel = "Antrag ansehen";
    private const string ApplicationLinkPath = "/manage/applications/";
    private const string Reason =
        "Du bekommst diese Mail, weil du über Beitrittsanträge entscheidest.";

    [Pure]
    public static OutgoingMail Compose(MembershipApplicationArrivalMailContent content) =>
        new()
        {
            Template = MailTemplate.MembershipApplicationArrival,
            Recipient = MailRecipient.Person(content.PersonId),
            To = content.To,
            Subject = $"{SubjectPrefix}{ApplicantOf(content)}",
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    public static string LinkOf(string clubAppBaseUrl, int membershipApplicationId) =>
        $"{clubAppBaseUrl.TrimEnd('/')}{ApplicationLinkPath}{membershipApplicationId.ToString(CultureInfo.InvariantCulture)}";

    [Pure]
    private static string TextOf(MembershipApplicationArrivalMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {LeadOf(content)}

            {content.Link}

            {Reason}

            Viele Grüße
            {SenderOf(content)}
            """;

    [Pure]
    private static string HtmlOf(MembershipApplicationArrivalMailContent content) =>
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
    private static string LeadOf(MembershipApplicationArrivalMailContent content) =>
        $"{ApplicantOf(content)} hat einen Beitrittsantrag gestellt und bestätigt. In der Vereins-App kannst du ihn ansehen und über die Aufnahme entscheiden:";

    [Pure]
    private static string ApplicantOf(MembershipApplicationArrivalMailContent content) =>
        OneLineOf($"{content.ApplicantFirstName} {content.ApplicantLastName}");

    [Pure]
    private static string OneLineOf(string typed) => LineBreakingRun().Replace(typed, " ").Trim();

    [Pure]
    private static string SenderOf(MembershipApplicationArrivalMailContent content) =>
        content.ClubName ?? FallbackClubName;

    [GeneratedRegex(@"[\s\p{C}]+")]
    private static partial Regex LineBreakingRun();
}
