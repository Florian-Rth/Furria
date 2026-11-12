using System.Diagnostics.Contracts;
using System.Globalization;
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
            Url = string.Create(CultureInfo.InvariantCulture, $"/announcements/{announcement.Id}"),
            Tag = TagOf(announcement.Id),
            ExpiresAt =
                announcement.PublishedAt
                + AnnouncementPushRules.TimeToLive(
                    announcement.ValidUntil,
                    announcement.PublishedAt
                ),
        };

    [Pure]
    internal static string TagOf(int announcementId) =>
        string.Create(CultureInfo.InvariantCulture, $"announcement-{announcementId}");
}
