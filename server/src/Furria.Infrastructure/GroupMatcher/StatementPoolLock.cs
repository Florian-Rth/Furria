using Furria.Application.Results;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.GroupMatcher;

internal static class StatementPoolLock
{
    private const long PoolLockKey = 7_300_006;

    public static async Task<Result> UnderPoolLockAsync(
        this AppDbContext dbContext,
        Func<Task<Result>> write,
        CancellationToken ct
    )
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);
        await dbContext.Database.ExecuteSqlAsync(
            $"SELECT pg_advisory_xact_lock({PoolLockKey})",
            ct
        );

        var result = await write();
        if (result.IsSuccess)
            await transaction.CommitAsync(ct);

        return result;
    }
}
