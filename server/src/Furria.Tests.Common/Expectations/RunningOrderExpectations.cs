using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class RunningOrderExpectations
{
    private readonly Expected _expected;
    private readonly int _eventId;

    internal RunningOrderExpectations(Expected expected, int eventId)
    {
        _expected = expected;
        _eventId = eventId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .RunningOrders.AsNoTracking()
                        .AnyAsync(row => row.CalendarEntryId == _eventId, ct),
                    $"Expected no running order for event {_eventId}."
                )
        );

    public Expected ToHaveVersion(int version) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    version,
                    (
                        await dbContext
                            .RunningOrders.AsNoTracking()
                            .SingleAsync(row => row.CalendarEntryId == _eventId, ct)
                    ).Version
                )
        );
}
