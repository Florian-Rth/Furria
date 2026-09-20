using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class CalendarEntryExpectations
{
    private readonly Expected _expected;
    private readonly int _calendarEntryId;

    internal CalendarEntryExpectations(Expected expected, int calendarEntryId)
    {
        _expected = expected;
        _calendarEntryId = calendarEntryId;
    }

    public Expected ToHaveTitle(string title) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(title, (await SingleAsync(dbContext, ct)).Title)
        );

    public Expected ToHaveKind(CalendarEntryKind kind) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(kind, (await SingleAsync(dbContext, ct)).Kind)
        );

    public Expected ToHaveVisibility(CalendarEntryVisibility visibility) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(visibility, (await SingleAsync(dbContext, ct)).Visibility)
        );

    public Expected ToBeOwnedBy(int? ownerGroupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(ownerGroupId, (await SingleAsync(dbContext, ct)).OwnerGroupId)
        );

    public Expected ToBeHeldAt(int? venueId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(venueId, (await SingleAsync(dbContext, ct)).VenueId)
        );

    public Expected ToAskForResponse(bool asksForResponse) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(asksForResponse, (await SingleAsync(dbContext, ct)).AsksForResponse)
        );

    private Task<CalendarEntry> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.CalendarEntries.AsNoTracking().SingleAsync(row => row.Id == _calendarEntryId, ct);
}
