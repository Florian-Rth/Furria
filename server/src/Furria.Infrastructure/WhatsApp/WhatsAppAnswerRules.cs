using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppAnswerRules
{
    public static readonly IReadOnlyList<WhatsAppAttendanceOption> AttendanceOptions =
    [
        new("Ja", AttendanceAnswer.Yes),
        new("Nein", AttendanceAnswer.No),
        new("Vielleicht", AttendanceAnswer.Maybe),
    ];

    [Pure]
    public static IReadOnlyList<int> PollOptionIdsOf(
        IReadOnlyList<string> postedOptions,
        IReadOnlyList<int> postedOptionIds,
        IReadOnlyList<string> selected
    ) =>
        [
            .. postedOptions
                .Select((text, position) => (text, position))
                .Where(option =>
                    selected.Contains(option.text) && option.position < postedOptionIds.Count
                )
                .Select(option => postedOptionIds[option.position]),
        ];

    [Pure]
    public static AttendanceAnswer? AttendanceOf(
        IReadOnlyList<string> postedOptions,
        IReadOnlyList<string> selected
    ) =>
        selected is [var only] && postedOptions.Contains(only)
            ? AttendanceOptions.FirstOrDefault(option => option.Label == only)?.Answer
            : null;

    [Pure]
    public static bool IsClosedAt(
        DateTimeOffset? closedAt,
        DateTimeOffset? deadline,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset answeredAt
    ) =>
        closedAt <= answeredAt
        || AddOnClosing.StampOf(deadline, hostClosesAt, answeredAt) is not null;
}
