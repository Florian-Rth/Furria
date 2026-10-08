using Furria.Core.Events;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class TicketRequestSetExpectations
{
    private readonly Expected _expected;

    internal TicketRequestSetExpectations(Expected expected)
    {
        _expected = expected;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(count, await dbContext.TicketRequests.CountAsync(ct))
        );

    public Expected ToHaveIds(params int[] ticketRequestIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    ticketRequestIds.Order(),
                    await dbContext
                        .TicketRequests.AsNoTracking()
                        .Select(request => request.Id)
                        .OrderBy(id => id)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHoldOnly(TicketRequest expected) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var stored = await dbContext.TicketRequests.AsNoTracking().SingleAsync(ct);
                Assert.Equal(expected.EventId, stored.EventId);
                Assert.Equal(expected.TicketCount, stored.TicketCount);
                Assert.Equal(expected.Name, stored.Name);
                Assert.Equal(expected.Phone, stored.Phone);
                Assert.Equal(expected.Email, stored.Email);
                Assert.Equal(expected.Message, stored.Message);
                Assert.Equal(expected.RequestedAt, stored.RequestedAt);
            }
        );
}
