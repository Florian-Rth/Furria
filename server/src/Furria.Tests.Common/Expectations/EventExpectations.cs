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

    public Expected ToSellAt(params int[] venueIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    venueIds,
                    await dbContext
                        .EventPresalePlaces.AsNoTracking()
                        .Where(place => place.EventId == _eventId)
                        .OrderBy(place => place.SortOrder)
                        .Select(place => place.VenueId)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveTeaser(string teaser) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(teaser, (await SingleAsync(dbContext, ct)).Teaser)
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

    public Expected ToBePublishedAt(DateTimeOffset publishedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(publishedAt, (await SingleAsync(dbContext, ct)).PublishedAt)
        );

    public Expected ToBeUnpublished() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).PublishedAt)
        );

    public Expected ToShowPicture(int? mediaItemId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(mediaItemId, (await SingleAsync(dbContext, ct)).PictureId)
        );

    private Task<Event> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Events.AsNoTracking().SingleAsync(row => row.CalendarEntryId == _eventId, ct);
}
