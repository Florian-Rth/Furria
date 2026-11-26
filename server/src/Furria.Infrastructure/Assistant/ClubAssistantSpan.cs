using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;

namespace Furria.Infrastructure.Assistant;

public sealed record ClubAssistantSpan(DateTimeOffset StartsAt, DateTimeOffset EndsAt)
{
    private static readonly TimeSpan PointInTime = TimeSpan.FromMinutes(1);

    private static readonly string[] TimeFormats = ["H:mm", "HH:mm", "%H", "HH"];

    [Pure]
    public static ClubAssistantSpan? Of(DateOnly day, string from, string? until)
    {
        if (from is null || TimeOf(from) is not { } starts)
            return null;

        var startsAt = ClubClock.At(day, starts);
        if (string.IsNullOrWhiteSpace(until))
            return new ClubAssistantSpan(startsAt, startsAt + PointInTime);

        if (TimeOf(until) is not { } ends)
            return null;

        return ends == starts
            ? new ClubAssistantSpan(startsAt, startsAt + PointInTime)
            : new ClubAssistantSpan(
                startsAt,
                ClubClock.At(ends > starts ? day : day.AddDays(1), ends)
            );
    }

    [Pure]
    public bool Overlaps(DateTimeOffset startsAt, DateTimeOffset endsAt) =>
        startsAt < EndsAt && endsAt > StartsAt;

    [Pure]
    private static TimeOnly? TimeOf(string text) =>
        TimeOnly.TryParseExact(
            text.Trim(),
            TimeFormats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var time
        )
            ? time
            : null;
}
