using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;
using Furria.Infrastructure.Push;

namespace Furria.Infrastructure.Club;

internal static class CalendarPushMessages
{
    private const string CalendarPath = "/calendar";

    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");

    [Pure]
    internal static OutboxPush For(OutboxCalendarPush push, int accountId, DateTimeOffset now) =>
        new()
        {
            AccountId = accountId,
            Title = TitleOf(push),
            Body = BodyOf(push),
            Url = UrlOf(push),
            Tag = string.Create(
                CultureInfo.InvariantCulture,
                $"calendar-entry-{push.CalendarEntryId}"
            ),
            ExpiresAt =
                now + CalendarPushRules.TimeToLive(push.ReminderClosesAt ?? push.StartsAt, now),
        };

    [Pure]
    private static string TitleOf(OutboxCalendarPush push) =>
        push.Reason switch
        {
            CalendarPushReason.Moved => $"Geändert: {push.Title}",
            CalendarPushReason.Deleted => $"Entfällt: {push.Title}",
            CalendarPushReason.Reminder => $"Erinnerung: {push.Title}",
            _ => push.Title,
        };

    [Pure]
    private static string BodyOf(OutboxCalendarPush push) =>
        push.Reason switch
        {
            CalendarPushReason.Moved => $"Jetzt {SlotOf(push)}.",
            CalendarPushReason.Deleted => $"{SlotOf(push)} fällt aus.",
            CalendarPushReason.Reminder => $"{SlotOf(push)}. {ReminderAskOf(push)}",
            _ when push.AsksForResponse => $"{SlotOf(push)}. Bitte sag zu oder ab.",
            _ => $"{SlotOf(push)}. Du bist eingeladen.",
        };

    [Pure]
    private static string ReminderAskOf(OutboxCalendarPush push) =>
        push.ReminderKind switch
        {
            CalendarEntryAddOnKind.Poll => $"Bitte stimm ab: {push.ReminderSubject}",
            CalendarEntryAddOnKind.SignUpList => $"Bitte trag dich ein: {push.ReminderSubject}",
            _ => "Bitte sag zu oder ab.",
        };

    [Pure]
    private static string UrlOf(OutboxCalendarPush push) =>
        push.Reason == CalendarPushReason.Deleted
            ? string.Create(
                CultureInfo.InvariantCulture,
                $"{CalendarPath}?day={ClubClock.DayOf(push.StartsAt):yyyy-MM-dd}"
            )
            : string.Create(CultureInfo.InvariantCulture, $"{CalendarPath}/{push.CalendarEntryId}");

    [Pure]
    private static string SlotOf(OutboxCalendarPush push)
    {
        var when = string.Create(
            German,
            $"{ClubClock.WallClockOf(push.StartsAt):ddd, d. MMM, HH:mm}"
        );

        return push.VenueName is { } venue ? $"{when} · {venue}" : when;
    }
}
