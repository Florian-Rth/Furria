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
