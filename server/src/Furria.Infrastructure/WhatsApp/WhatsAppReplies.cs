using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppReplies
{
    private const string CancelledNote = "Findet nicht statt.";
    private const string ReplacedNote =
        "Die Antworten wurden geändert. Bitte in der neuen Abstimmung antworten.";
    private const string MovedLead = "Neu: ";
    private const string PollClosedHead = "*Abstimmung beendet*";
    private const string AttendanceClosedHead = "*Zu-/Absage beendet*";
    private const string LateAttendanceNote = "Die Zu-/Absage ist schon beendet.";
    private const string LateAnswerNote = "Deine Antwort wurde nicht übernommen.";

    public static readonly string Cancelled = WhatsAppBadges.Headed(
        WhatsAppBadge.Cancelled,
        CancelledNote
    );

    public static readonly string Replaced = WhatsAppBadges.Headed(
        WhatsAppBadge.Replaced,
        ReplacedNote
    );

    [Pure]
    public static string Moved(WhatsAppPostSlot slot) =>
        WhatsAppBadges.Headed(WhatsAppBadge.Moved, MovedLead + WhatsAppPostText.DateLineOf(slot));

    [Pure]
    public static string PollResult(IEnumerable<WhatsAppResultCount> counts) =>
        ResultOf(PollClosedHead, counts);

    [Pure]
    public static string AttendanceResult(IReadOnlyDictionary<AttendanceAnswer, int> counts) =>
        ResultOf(
            AttendanceClosedHead,
            WhatsAppAnswerRules.AttendanceOptions.Select(option => new WhatsAppResultCount(
                option.Label,
                counts.GetValueOrDefault(option.Answer)
            ))
        );

    [Pure]
    public static string LateAnswer(string title, string? pollQuestion, string link) =>
        WhatsAppBadges.Headed(
            WhatsAppBadge.Closed,
            string.Join(
                '\n',
                WhatsAppFormatting.Bold(title),
                LateNoteOf(pollQuestion),
                LateAnswerNote,
                WhatsAppBadges.LinkLineOf(link)
            )
        );

    [Pure]
    private static string LateNoteOf(string? pollQuestion) =>
        pollQuestion is null
            ? LateAttendanceNote
            : $"Die Abstimmung „{pollQuestion}“ ist schon beendet.";

    [Pure]
    private static string ResultOf(string head, IEnumerable<WhatsAppResultCount> counts) =>
        WhatsAppBadges.Headed(
            WhatsAppBadge.Result,
            string.Join(
                '\n',
                counts
                    .Select(count =>
                        string.Create(CultureInfo.InvariantCulture, $"{count.Label}: {count.Count}")
                    )
                    .Prepend(head)
            )
        );
}
