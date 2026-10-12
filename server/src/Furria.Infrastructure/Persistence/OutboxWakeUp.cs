using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Furria.Infrastructure.Persistence;

public sealed class OutboxWakeUp : DbTransactionInterceptor, ISaveChangesInterceptor
{
    private readonly IReadOnlyList<OutboxSignal> _signals;

    public OutboxWakeUp(IEnumerable<OutboxSignal> signals)
    {
        _signals = [.. signals];
    }

    public override void TransactionCommitted(
        DbTransaction transaction,
        TransactionEndEventData eventData
    ) => RingAll();

    public override Task TransactionCommittedAsync(
        DbTransaction transaction,
        TransactionEndEventData eventData,
        CancellationToken cancellationToken = default
    )
    {
        RingAll();
        return Task.CompletedTask;
    }

    public int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        RingAll();
        return result;
    }

    public ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default
    )
    {
        RingAll();
        return ValueTask.FromResult(result);
    }

    private void RingAll()
    {
        foreach (var signal in _signals)
            signal.Ring();
    }
}
