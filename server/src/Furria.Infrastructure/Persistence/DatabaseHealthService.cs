using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Persistence;

public sealed class DatabaseHealthService
{
    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(2);

    private readonly AppDbContext _db;

    public DatabaseHealthService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> IsReadyAsync(CancellationToken ct)
    {
        using var probe = CancellationTokenSource.CreateLinkedTokenSource(ct);
        probe.CancelAfter(ProbeTimeout);
        try
        {
            return await _db.Database.CanConnectAsync(probe.Token)
                && !(await _db.Database.GetPendingMigrationsAsync(probe.Token)).Any();
        }
        catch (Exception exception)
            when (exception is DbException
                || (exception is OperationCanceledException && !ct.IsCancellationRequested)
            )
        {
            return false;
        }
    }
}
