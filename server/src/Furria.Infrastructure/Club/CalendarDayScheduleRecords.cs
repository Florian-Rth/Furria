using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class CalendarDayScheduleRecords
{
    private const string UnknownDayScheduleMessage = "Diesen Tagesablauf gibt es nicht.";
    private const string StepOutsideTheDaysMessage =
        "Ein Schritt im Tagesablauf liegt außerhalb der Tage des Eintrags.";

    private static readonly IReadOnlyDictionary<
        int,
        IReadOnlyList<PlacedDaySchedule>
    > NoDaySchedules = new Dictionary<int, IReadOnlyList<PlacedDaySchedule>>();

    internal static string? ReconcileDaySchedules(
        CalendarEntry entry,
        IReadOnlyList<CalendarEntryAddOnInput> addOns,
        int daysSpanned
    )
    {
        var wanted = WantedSchedulesOf(addOns);

        if (!wanted.All(placed => IsNewOrHeld(entry, placed)))
            return UnknownDayScheduleMessage;

        if (!wanted.All(placed => WithinTheDays(placed, daysSpanned)))
            return StepOutsideTheDaysMessage;

        foreach (
            var dropped in entry.DaySchedules.Where(schedule => !IsKept(schedule, wanted)).ToList()
        )
            entry.DaySchedules.Remove(dropped);

        foreach (var placed in wanted)
            Apply(ScheduleFor(entry, placed.Schedule.DayScheduleId), placed);

        return null;
    }

    internal static async Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedDaySchedule>>
    > DaySchedulesOfEntriesAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> calendarEntryIds,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return NoDaySchedules;

        var schedules = await dbContext
            .CalendarDaySchedules.AsNoTracking()
            .Where(schedule => calendarEntryIds.Contains(schedule.CalendarEntryId))
            .Select(schedule => new DayScheduleRow(
                schedule.CalendarEntryId,
                schedule.Position,
                new CalendarDayScheduleDetails
                {
                    DayScheduleId = schedule.Id,
                    Title = schedule.Title,
                    Steps = schedule
                        .Steps.OrderBy(step => step.Day)
                        .ThenBy(step => step.Time)
                        .ThenBy(step => step.Id)
                        .Select(step => new CalendarDayScheduleStepDetails
                        {
                            StepId = step.Id,
                            Day = step.Day,
                            Time = step.Time,
                            Text = step.Text,
                        })
                        .ToList(),
                }
            ))
            .AsSingleQuery()
            .ToListAsync(ct);

        if (schedules.Count == 0)
            return NoDaySchedules;

        return schedules
            .GroupBy(schedule => schedule.CalendarEntryId)
            .ToDictionary(
                group => group.Key,
                group =>
                    (IReadOnlyList<PlacedDaySchedule>)
                        [
                            .. group.Select(schedule => new PlacedDaySchedule(
                                schedule.Position,
                                schedule.Details
                            )),
                        ]
            );
    }

    [Pure]
    private static IReadOnlyList<WantedDaySchedule> WantedSchedulesOf(
        IReadOnlyList<CalendarEntryAddOnInput> addOns
    ) =>
        [
            .. addOns.SelectMany(
                (addOn, position) =>
                    addOn.DaySchedule is { } schedule
                        ? [new WantedDaySchedule(position, schedule)]
                        : Array.Empty<WantedDaySchedule>()
            ),
        ];

    [Pure]
    private static bool IsNewOrHeld(CalendarEntry entry, WantedDaySchedule placed) =>
        placed.Schedule.DayScheduleId is not { } scheduleId
            ? placed.Schedule.Steps.All(step => step.StepId is null)
            : entry.DaySchedules.SingleOrDefault(schedule => schedule.Id == scheduleId) is { } held
                && placed.Schedule.Steps.All(step => IsNewOrHeldStep(held, step));

    [Pure]
    private static bool IsNewOrHeldStep(
        CalendarDaySchedule held,
        CalendarDayScheduleStepInput step
    ) => step.StepId is not { } stepId || held.Steps.Any(heldStep => heldStep.Id == stepId);

    [Pure]
    private static bool WithinTheDays(WantedDaySchedule placed, int daysSpanned) =>
        placed.Schedule.Steps.All(step => step.Day >= 0 && step.Day < daysSpanned);

    [Pure]
    private static bool IsKept(CalendarDaySchedule held, IReadOnlyList<WantedDaySchedule> wanted) =>
        wanted.Any(placed => placed.Schedule.DayScheduleId == held.Id);

    [Pure]
    private static string? TitleOf(string? title) =>
        string.IsNullOrWhiteSpace(title) ? null : title.Trim();

    private static CalendarDaySchedule ScheduleFor(CalendarEntry entry, int? dayScheduleId)
    {
        if (dayScheduleId is { } heldId)
            return entry.DaySchedules.Single(schedule => schedule.Id == heldId);

        var schedule = new CalendarDaySchedule();
        entry.DaySchedules.Add(schedule);
        return schedule;
    }

    private static void Apply(CalendarDaySchedule schedule, WantedDaySchedule placed)
    {
        schedule.Position = placed.Position;
        schedule.Title = TitleOf(placed.Schedule.Title);

        var keptStepIds = placed
            .Schedule.Steps.Select(step => step.StepId)
            .OfType<int>()
            .ToHashSet();

        foreach (
            var dropped in schedule.Steps.Where(step => !keptStepIds.Contains(step.Id)).ToList()
        )
            schedule.Steps.Remove(dropped);

        foreach (var step in placed.Schedule.Steps)
            ApplyStep(StepFor(schedule, step.StepId), step);
    }

    private static CalendarDayScheduleStep StepFor(CalendarDaySchedule schedule, int? stepId)
    {
        if (stepId is { } heldId)
            return schedule.Steps.Single(step => step.Id == heldId);

        var step = new CalendarDayScheduleStep();
        schedule.Steps.Add(step);
        return step;
    }

    private static void ApplyStep(CalendarDayScheduleStep step, CalendarDayScheduleStepInput wanted)
    {
        step.Day = wanted.Day;
        step.Time = wanted.Time;
        step.Text = wanted.Text.Trim();
    }

    private sealed record WantedDaySchedule(int Position, CalendarDayScheduleInput Schedule);

    private sealed record DayScheduleRow(
        int CalendarEntryId,
        int Position,
        CalendarDayScheduleDetails Details
    );
}

internal sealed record PlacedDaySchedule(int Position, CalendarDayScheduleDetails Details);
