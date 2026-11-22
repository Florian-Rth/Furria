using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppHostLinks
{
    private const string AnnouncementPath = "/announcements";
    private const string CalendarPath = "/calendar";

    [Pure]
    public static string AnnouncementOf(string baseUrl, int announcementId) =>
        Of(baseUrl, AnnouncementPath, announcementId);

    [Pure]
    public static string CalendarEntryOf(string baseUrl, int calendarEntryId) =>
        Of(baseUrl, CalendarPath, calendarEntryId);

    [Pure]
    public static string HostOf(string baseUrl, WhatsAppHostKind kind, int hostId) =>
        kind == WhatsAppHostKind.Announcement
            ? AnnouncementOf(baseUrl, hostId)
            : CalendarEntryOf(baseUrl, hostId);

    [Pure]
    private static string Of(string baseUrl, string path, int id) =>
        string.Create(CultureInfo.InvariantCulture, $"{baseUrl.TrimEnd('/')}{path}/{id}");
}
