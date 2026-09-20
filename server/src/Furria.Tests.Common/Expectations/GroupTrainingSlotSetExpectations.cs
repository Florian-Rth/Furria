using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GroupTrainingSlotSetExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal GroupTrainingSlotSetExpectations(Expected expected, int groupId)
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
                        .GroupTrainingSlots.AsNoTracking()
                        .CountAsync(slot => slot.GroupId == _groupId, ct)
                )
        );

    public Expected ToBeEmpty() => ToHaveCount(0);

    public Expected ToCarrySlot(
        DayOfWeek weekday,
        TimeOnly startsAt,
        int durationMinutes,
        int? venueId
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext
                        .GroupTrainingSlots.AsNoTracking()
                        .AnyAsync(
                            slot =>
                                slot.GroupId == _groupId
                                && slot.Weekday == weekday
                                && slot.StartsAt == startsAt
                                && slot.DurationMinutes == durationMinutes
                                && slot.VenueId == venueId,
                            ct
                        ),
                    $"Expected a Trainingsslot on {weekday} at {startsAt} for Gruppe {_groupId}."
                )
        );
}
