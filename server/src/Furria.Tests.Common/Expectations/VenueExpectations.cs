using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class VenueExpectations
{
    private readonly Expected _expected;
    private readonly int _venueId;

    internal VenueExpectations(Expected expected, int venueId)
    {
        _expected = expected;
        _venueId = venueId;
    }

    public Expected ToHaveName(string name) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(name, (await SingleAsync(dbContext, ct)).Name)
        );

    public Expected ToHaveSortOrder(int sortOrder) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(sortOrder, (await SingleAsync(dbContext, ct)).SortOrder)
        );

    private Task<Venue> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Venues.AsNoTracking().SingleAsync(row => row.Id == _venueId, ct);
}
