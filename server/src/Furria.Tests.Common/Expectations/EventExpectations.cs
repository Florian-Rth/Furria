using Furria.Core.Events;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class EventExpectations
{
    private readonly Expected _expected;
    private readonly int _eventId;

    internal EventExpectations(Expected expected, int eventId)
    {
        _expected = expected;
        _eventId = eventId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .Events.AsNoTracking()
                        .AnyAsync(row => row.CalendarEntryId == _eventId, ct),
                    $"Expected no Event with id {_eventId}."
                )
        );

    public Expected ToHaveTeaser(string teaser) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(teaser, (await SingleAsync(dbContext, ct)).Teaser)
        );

    public Expected ToOpenDoorsAt(TimeOnly? doorsOpenAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(doorsOpenAt, (await SingleAsync(dbContext, ct)).DoorsOpenAt)
        );

    public Expected ToHaveAgeHint(string? ageHint) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(ageHint, (await SingleAsync(dbContext, ct)).AgeHint)
        );

    public Expected ToCost(int? priceCents) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(priceCents, (await SingleAsync(dbContext, ct)).PriceCents)
        );

    public Expected ToStartPresaleAt(DateTimeOffset? presaleStartsAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(presaleStartsAt, (await SingleAsync(dbContext, ct)).PresaleStartsAt)
        );

    public Expected ToHaveTicketAvailability(TicketAvailability availability) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(availability, (await SingleAsync(dbContext, ct)).TicketAvailability)
        );

    public Expected ToBeCancelledAt(DateTimeOffset cancelledAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(cancelledAt, (await SingleAsync(dbContext, ct)).CancelledAt)
        );

    public Expected ToNotBeCancelled() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).CancelledAt)
        );

    private Task<Event> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Events.AsNoTracking().SingleAsync(row => row.CalendarEntryId == _eventId, ct);
}
