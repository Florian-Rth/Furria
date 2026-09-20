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

    public Expected ToHaveAddress(string street, string zip, string city) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var venue = await SingleAsync(dbContext, ct);
                Assert.Equal(street, venue.Street);
                Assert.Equal(zip, venue.Zip);
                Assert.Equal(city, venue.City);
            }
        );

    public Expected ToHaveHint(string? hint) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(hint, (await SingleAsync(dbContext, ct)).Hint)
        );

    public Expected ToBeArchivedOn(DateOnly? archivedOn) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(archivedOn, (await SingleAsync(dbContext, ct)).ArchivedOn)
        );

    private Task<Venue> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Venues.AsNoTracking().SingleAsync(row => row.Id == _venueId, ct);
}
