using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text.Json;
using Furria.Core.Club;
using Furria.Infrastructure.Push;

namespace Furria.Infrastructure.Club;

internal static class AnnouncementPushMessages
{
    private const string Title = "Neuer Aushang";

    [Pure]
    internal static OutboxPush For(Announcement announcement, int accountId) =>
        new()
        {
            AccountId = accountId,
            Title = Title,
            Body = announcement.Title,
            Url = UrlOf(announcement.Id),
            Tag = TagOf(announcement.Id),
            ExpiresAt =
                announcement.PublishedAt
                + AnnouncementPushRules.TimeToLive(
                    announcement.ValidUntil,
                    announcement.PublishedAt
                ),
        };

    [Pure]
    internal static OutboxPush ReminderFor(
        Announcement announcement,
        AnnouncementReminder reminder,
        int accountId,
        DateTimeOffset expiresAt
    ) =>
        new()
        {
            AccountId = accountId,
            Title = $"Erinnerung: {announcement.Title}",
            Body = AskOf(reminder),
            Url = UrlOf(announcement.Id),
            Tag = ReminderTagOf(announcement.Id, reminder.Kind, reminder.AddOnId),
            ExpiresAt = expiresAt,
        };

    [Pure]
    internal static string ReminderTagOf(
        int announcementId,
        AnnouncementAddOnKind kind,
        int addOnId
    ) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{ReminderTagPrefixOf(announcementId)}{JsonNamingPolicy.CamelCase.ConvertName(kind.ToString())}-{addOnId}"
        );

    [Pure]
    internal static string ReminderTagPrefixOf(int announcementId) =>
        string.Create(CultureInfo.InvariantCulture, $"announcement-{announcementId}-reminder-");

    [Pure]
    private static string AskOf(AnnouncementReminder reminder) =>
        reminder.Kind switch
        {
            AnnouncementAddOnKind.Poll => $"Bitte stimm ab: {reminder.Subject}",
            AnnouncementAddOnKind.SignUpList => $"Bitte trag dich ein: {reminder.Subject}",
            _ => "Bitte sag zu oder ab.",
        };

    [Pure]
    private static string UrlOf(int announcementId) =>
        string.Create(CultureInfo.InvariantCulture, $"/announcements/{announcementId}");

    [Pure]
    internal static string TagOf(int announcementId) =>
        string.Create(CultureInfo.InvariantCulture, $"announcement-{announcementId}");
}
