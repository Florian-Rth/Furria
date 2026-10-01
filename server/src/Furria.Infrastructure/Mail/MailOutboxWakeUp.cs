using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Furria.Infrastructure.Mail;

public sealed class MailOutboxWakeUp : DbTransactionInterceptor, ISaveChangesInterceptor
{
    private readonly MailOutboxSignal _signal;

    public MailOutboxWakeUp(MailOutboxSignal signal)
    {
        _signal = signal;
    }

    public override void TransactionCommitted(
        DbTransaction transaction,
        TransactionEndEventData eventData
    ) => _signal.Ring();

    public override Task TransactionCommittedAsync(
        DbTransaction transaction,
        TransactionEndEventData eventData,
        CancellationToken cancellationToken = default
    )
    {
        _signal.Ring();
        return Task.CompletedTask;
    }

    public int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        _signal.Ring();
        return result;
    }

    public ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default
    )
    {
        _signal.Ring();
        return ValueTask.FromResult(result);
    }
}
