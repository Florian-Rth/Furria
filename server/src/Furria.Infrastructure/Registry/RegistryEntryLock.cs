using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

internal static class RegistryEntryLock
{
    private const long EntryLockKey = 7_300_009;

    public static async Task LockRegistryEntryAsync(
        this AppDbContext dbContext,
        CancellationToken ct
    ) =>
        await dbContext.Database.ExecuteSqlAsync(
            $"SELECT pg_advisory_xact_lock({EntryLockKey})",
            ct
        );
}
