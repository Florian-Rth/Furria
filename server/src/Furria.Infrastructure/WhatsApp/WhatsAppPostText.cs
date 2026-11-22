using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppPostText
{
    private const string Paragraph = "\n\n";
    private const string SlotSeparator = " · ";
    private const string GroupsLead = "Dabei: ";

    private static readonly IReadOnlyList<string> Weekdays =
    [
        "So",
        "Mo",
        "Di",
        "Mi",
        "Do",
        "Fr",
        "Sa",
    ];

    [Pure]
    public static WhatsAppPostContent Render(WhatsAppPostDraft draft)
    {
        var body = BodyOf(draft.Body, draft.MentionablePhones);
        var spansDays = draft.Slot is { } slot && SpansDays(slot);
        string?[] blocks =
        [
            WhatsAppBadges.Headed(draft.Badge, HeadOf(draft.Title, draft.Slot)),
            body?.Text,
            .. draft.Schedules.Select(schedule => ScheduleOf(schedule, draft.Slot, spansDays)),
            GroupsOf(draft.GroupNames),
            .. draft.TakenOverAddOns.Select(WhatsAppAddOnMessages.LineOf),
            LinkBlockOf(draft.AuthorName, WhatsAppBadges.LinkLineOf(draft.Link)),
        ];

        return new WhatsAppPostContent(
            string.Join(Paragraph, blocks.Where(block => !string.IsNullOrEmpty(block))),
            body?.MentionedChatIds ?? []
        );
    }

    [Pure]
    private static string HeadOf(string title, WhatsAppPostSlot? slot) =>
        slot is null
            ? WhatsAppFormatting.Bold(title)
            : $"{WhatsAppFormatting.Bold(title)}\n{DateLineOf(slot)}";

    [Pure]
    private static WhatsAppPostContent? BodyOf(
        WhatsAppPostBody? body,
        IReadOnlyDictionary<int, string> mentionablePhones
    ) =>
        body switch
        {
            null => null,
            { Text: var text } when string.IsNullOrWhiteSpace(text) => null,
            { IsRichText: true } => WhatsAppFormatting.FromRichText(body.Text, mentionablePhones),
            _ => new WhatsAppPostContent(body.Text.Trim(), []),
        };

    [Pure]
    public static string DateLineOf(WhatsAppPostSlot slot)
    {
        var starts = ClubClock.WallClockOf(slot.StartsAt);
        var when = slot.EndsAt is { } endsAt
            ? SpanOf(starts, ClubClock.WallClockOf(endsAt))
            : $"{DayOf(starts)}{SlotSeparator}{TimeOf(starts)} Uhr";

        return slot.VenueName is { } venue ? $"{when}{SlotSeparator}{venue}" : when;
    }

    [Pure]
    public static string DeadlineOf(DateTimeOffset until)
    {
        var wallClock = ClubClock.WallClockOf(until);
        return $"{DayOf(wallClock)}{SlotSeparator}{TimeOf(wallClock)} Uhr";
    }

    [Pure]
    private static string SpanOf(DateTimeOffset starts, DateTimeOffset ends) =>
        DateOnly.FromDateTime(starts.DateTime) == DateOnly.FromDateTime(ends.DateTime)
            ? $"{DayOf(starts)}{SlotSeparator}{TimeOf(starts)}–{TimeOf(ends)} Uhr"
            : $"{DayOf(starts)} {TimeOf(starts)} Uhr – {DayOf(ends)} {TimeOf(ends)} Uhr";

    [Pure]
    private static bool SpansDays(WhatsAppPostSlot slot) =>
        ClubClock.DaysSpanned(slot.StartsAt, slot.EndsAt) > 1;

    [Pure]
    private static string DayOf(DateTimeOffset wallClock) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{Weekdays[(int)wallClock.DayOfWeek]} {wallClock.Day}.{wallClock.Month}."
        );

    [Pure]
    private static string TimeOf(DateTimeOffset wallClock) =>
        wallClock.ToString("HH:mm", CultureInfo.InvariantCulture);

    [Pure]
    private static string ScheduleOf(
        WhatsAppPostSchedule schedule,
        WhatsAppPostSlot? slot,
        bool spansDays
    )
    {
        var steps = schedule.Steps.Select(step => StepOf(step, slot, spansDays));
        var lines = schedule.Title is { } title
            ? steps.Prepend(WhatsAppFormatting.Bold(title))
            : steps;

        return string.Join('\n', lines);
    }

    [Pure]
    private static string StepOf(WhatsAppPostStep step, WhatsAppPostSlot? slot, bool spansDays)
    {
        var time = step.Time.ToString("HH:mm", CultureInfo.InvariantCulture);
        if (!spansDays || slot is null)
            return $"{time} {step.Text}";

        var day = ClubClock.WallClockOf(slot.StartsAt).AddDays(step.Day);
        return $"{Weekdays[(int)day.DayOfWeek]} {time} {step.Text}";
    }

    [Pure]
    private static string? GroupsOf(IReadOnlyList<string> groupNames) =>
        groupNames.Count == 0 ? null : GroupsLead + string.Join(", ", groupNames);

    [Pure]
    private static string LinkBlockOf(string? authorName, string linkLine) =>
        authorName is null ? linkLine : $"{WhatsAppFormatting.Italic(authorName)}\n{linkLine}";
}
