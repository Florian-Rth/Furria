using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class CalendarDayScheduleExpectations
{
    private readonly Expected _expected;
    private readonly int _dayScheduleId;

    internal CalendarDayScheduleExpectations(Expected expected, int dayScheduleId)
    {
        _expected = expected;
        _dayScheduleId = dayScheduleId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .CalendarDaySchedules.AsNoTracking()
                        .AnyAsync(row => row.Id == _dayScheduleId, ct),
                    $"Expected no CalendarDaySchedule with id {_dayScheduleId}."
                )
        );

    public Expected ToHaveSteps(
        string? title,
        params (int Day, TimeOnly Time, string Text)[] steps
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var schedule = await dbContext
                    .CalendarDaySchedules.AsNoTracking()
                    .Include(row => row.Steps)
                    .SingleAsync(row => row.Id == _dayScheduleId, ct);

                Assert.Equal(title, schedule.Title);
                Assert.Equal(
                    steps,
                    schedule
                        .Steps.OrderBy(step => step.Day)
                        .ThenBy(step => step.Time)
                        .Select(step => (step.Day, step.Time, step.Text))
                );
            }
        );

    public Expected ToHaveStep(int stepId, int day, TimeOnly time, string text) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var step = await dbContext
                    .CalendarDayScheduleSteps.AsNoTracking()
                    .SingleAsync(row => row.Id == stepId, ct);

                Assert.Equal(
                    (_dayScheduleId, day, time, text),
                    (step.DayScheduleId, step.Day, step.Time, step.Text)
                );
            }
        );
}
