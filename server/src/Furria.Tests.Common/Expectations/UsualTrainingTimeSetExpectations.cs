using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class UsualTrainingTimeSetExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal UsualTrainingTimeSetExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .UsualTrainingTimes.AsNoTracking()
                        .CountAsync(usualTime => usualTime.GroupId == _groupId, ct)
                )
        );

    public Expected ToBeEmpty() => ToHaveCount(0);

    public Expected ToCarryUsualTime(
        DayOfWeek weekday,
        TimeOnly startsAt,
        int durationMinutes,
        int? venueId
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext
                        .UsualTrainingTimes.AsNoTracking()
                        .AnyAsync(
                            usualTime =>
                                usualTime.GroupId == _groupId
                                && usualTime.Weekday == weekday
                                && usualTime.StartsAt == startsAt
                                && usualTime.DurationMinutes == durationMinutes
                                && usualTime.VenueId == venueId,
                            ct
                        ),
                    $"Expected a UsualTrainingTime on {weekday} at {startsAt} for Group {_groupId}."
                )
        );
}
