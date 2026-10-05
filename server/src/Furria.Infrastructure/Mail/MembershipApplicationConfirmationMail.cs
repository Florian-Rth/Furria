using System.Diagnostics.Contracts;
using System.Globalization;
using System.Net;
using Furria.Core.MembershipApplications;

namespace Furria.Infrastructure.Mail;

public static class MembershipApplicationConfirmationMail
{
    private const string Subject = "Bitte bestätige deinen Beitrittsantrag";
    private const string FallbackClubName = "Dein Verein";
    private const string UnnamedClub = "unseren Verein";
    private const string LinkLabel = "Antrag bestätigen";
    private const string ConfirmationLinkPath = "/join/confirm#token=";

    private static readonly string Validity =
        $"Der Link gilt {MembershipApplication.ConfirmationWindow.TotalHours.ToString(CultureInfo.InvariantCulture)} Stunden. Bestätigst du den Antrag nicht, löschen wir ihn danach. Wenn du keinen Beitrittsantrag gestellt hast, ignoriere diese Mail einfach.";

    [Pure]
    public static OutgoingMail Compose(MembershipApplicationConfirmationMailContent content) =>
        new()
        {
            Template = MailTemplate.MembershipApplicationConfirmation,
            Recipient = MailRecipient.MembershipApplication(content.MembershipApplicationId),
            To = content.To,
            Subject = Subject,
            TextBody = TextOf(content),
            HtmlBody = HtmlOf(content),
        };

    [Pure]
    public static string LinkOf(string websiteBaseUrl, string token) =>
        $"{websiteBaseUrl.TrimEnd('/')}{ConfirmationLinkPath}{token}";

    [Pure]
    private static string TextOf(MembershipApplicationConfirmationMailContent content) =>
        $"""
            Hallo {content.FirstName},

            {LeadOf(content)}

            {content.Link}

            {Validity}

            Viele Grüße
            {SenderOf(content)}
            """;

    [Pure]
    private static string HtmlOf(MembershipApplicationConfirmationMailContent content) =>
        $"""
            <!DOCTYPE html>
            <html lang="de">
            <body style="font-family: sans-serif; line-height: 1.5;">
            <p>Hallo {WebUtility.HtmlEncode(content.FirstName)},</p>
            <p>{WebUtility.HtmlEncode(LeadOf(content))}</p>
            <p><a href="{WebUtility.HtmlEncode(content.Link)}">{LinkLabel}</a></p>
            <p>{WebUtility.HtmlEncode(Validity)}</p>
            <p>Viele Grüße<br>{WebUtility.HtmlEncode(SenderOf(content))}</p>
            </body>
            </html>
            """;

    [Pure]
    private static string LeadOf(MembershipApplicationConfirmationMailContent content) =>
        $"du hast gerade einen Beitrittsantrag für {content.ClubName ?? UnnamedClub} gestellt. Bitte bestätige ihn über diesen Link – erst dann kommt er beim Verein an:";

    [Pure]
    private static string SenderOf(MembershipApplicationConfirmationMailContent content) =>
        content.ClubName ?? FallbackClubName;
}
