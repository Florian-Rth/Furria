using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public static class ActStepLock
{
    public static Task LockStepsOfActAsync(
        this AppDbContext dbContext,
        int actId,
        CancellationToken ct
    ) =>
        dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM act WHERE id = {actId} FOR NO KEY UPDATE",
            ct
        );
}
