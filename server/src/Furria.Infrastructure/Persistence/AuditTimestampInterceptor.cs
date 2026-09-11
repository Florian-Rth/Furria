using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Furria.Infrastructure.Persistence;

public sealed class AuditTimestampInterceptor : SaveChangesInterceptor
{
    private static readonly string CreatedAtProperty = nameof(ITimestamped.CreatedAt);
    private static readonly string UpdatedAtProperty = nameof(ITimestamped.UpdatedAt);

    private readonly TimeProvider _timeProvider;

    public AuditTimestampInterceptor(TimeProvider timeProvider)
    {
        _timeProvider = timeProvider;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result
    )
    {
        Stamp(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default
    )
    {
        Stamp(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void Stamp(DbContext? dbContext)
    {
        if (dbContext is null)
            return;

        var stampedAt = _timeProvider.GetUtcNow();

        foreach (var entry in dbContext.ChangeTracker.Entries<ITimestamped>())
        {
            if (entry.State is EntityState.Added)
            {
                entry.Property(CreatedAtProperty).CurrentValue = stampedAt;
                entry.Property(UpdatedAtProperty).CurrentValue = stampedAt;
            }
            else if (entry.State is EntityState.Modified)
            {
                entry.Property(UpdatedAtProperty).CurrentValue = stampedAt;
            }
        }
    }
}
