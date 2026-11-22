using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppBadges
{
    private const string ClubMark = "FCC";
    private const string LinkMark = "↗ ";

    private static readonly IReadOnlyDictionary<WhatsAppBadge, (string Icon, string Label)> Marks =
        new Dictionary<WhatsAppBadge, (string, string)>
        {
            [WhatsAppBadge.Appointment] = ("📅", "TERMIN"),
            [WhatsAppBadge.Training] = ("💃", "TRAINING"),
            [WhatsAppBadge.Trip] = ("🚌", "AUSFLUG"),
            [WhatsAppBadge.Event] = ("🎉", "VERANSTALTUNG"),
            [WhatsAppBadge.Announcement] = ("📌", "AUSHANG"),
            [WhatsAppBadge.Vote] = ("🗳️", "ABSTIMMUNG"),
            [WhatsAppBadge.SignUpList] = ("📝", "EINTRAGSLISTE"),
            [WhatsAppBadge.Moved] = ("🕒", "VERSCHOBEN"),
            [WhatsAppBadge.Cancelled] = ("🚫", "ABGESAGT"),
            [WhatsAppBadge.Replaced] = ("🔄", "NEUE ABSTIMMUNG"),
            [WhatsAppBadge.Result] = ("📊", "ERGEBNIS"),
            [WhatsAppBadge.Closed] = ("⌛", "BEENDET"),
        };

    [Pure]
    public static string HeadOf(WhatsAppBadge badge) =>
        $"{Marks[badge].Icon} `{ClubMark} · {Marks[badge].Label}`";

    [Pure]
    public static string Headed(WhatsAppBadge badge, string text) => $"{HeadOf(badge)}\n{text}";

    [Pure]
    public static string LinkLineOf(string link) => LinkMark + link;

    [Pure]
    public static WhatsAppBadge OfEntryKind(CalendarEntryKind kind) =>
        kind switch
        {
            CalendarEntryKind.Training => WhatsAppBadge.Training,
            CalendarEntryKind.Trip => WhatsAppBadge.Trip,
            CalendarEntryKind.Event => WhatsAppBadge.Event,
            _ => WhatsAppBadge.Appointment,
        };
}
