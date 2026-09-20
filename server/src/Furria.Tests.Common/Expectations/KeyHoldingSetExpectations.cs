using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class KeyHoldingSetExpectations
{
    private readonly Expected _expected;
    private readonly int _venueId;

    internal KeyHoldingSetExpectations(Expected expected, int venueId)
    {
        _expected = expected;
        _venueId = venueId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .KeyHoldings.AsNoTracking()
                        .CountAsync(row => row.VenueId == _venueId, ct)
                )
        );

    public Expected ToHaveOpenCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .KeyHoldings.AsNoTracking()
                        .CountAsync(row => row.VenueId == _venueId && row.UntilOn == null, ct)
                )
        );
}
