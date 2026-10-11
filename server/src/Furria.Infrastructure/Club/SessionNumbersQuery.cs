using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public static class SessionNumbersQuery
{
    public static async Task<SessionNumbers> SessionNumbersAsync(
        this AppDbContext dbContext,
        CancellationToken ct
    ) =>
        new(
            await dbContext
                .Sessions.AsNoTracking()
                .ToDictionaryAsync(session => session.StartYear, session => session.Number, ct)
        );
}
