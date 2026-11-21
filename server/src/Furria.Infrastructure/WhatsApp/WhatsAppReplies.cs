using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppReplies
{
    public const string Cancelled = "*Abgesagt*";
    public const string Withdrawn = "*Zurückgezogen*";
    public const string Replaced = "*Ersetzt durch eine neue Abstimmung*";

    private const string MovedLead = "*Verschoben:* ";
    private const string PollClosedHead = "*Abstimmung beendet*";
    private const string AttendanceClosedHead = "*Zu-/Absage beendet*";

    [Pure]
    public static string Moved(WhatsAppPostSlot slot) =>
        MovedLead + WhatsAppPostText.DateLineOf(slot);

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
    private static string ResultOf(string head, IEnumerable<WhatsAppResultCount> counts) =>
        string.Join(
            '\n',
            counts
                .Select(count =>
                    string.Create(CultureInfo.InvariantCulture, $"{count.Label}: {count.Count}")
                )
                .Prepend(head)
        );
}
