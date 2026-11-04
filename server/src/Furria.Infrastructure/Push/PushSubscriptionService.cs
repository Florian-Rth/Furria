using Furria.Application.Push;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Push;

public sealed class PushSubscriptionService
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PushSubscriptionService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task SubscribeAsync(SubscribePushDeviceCommand command, CancellationToken ct)
    {
        var subscribedAt = _timeProvider.GetUtcNow();

        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO push_subscription (account_id, endpoint, public_key, auth_secret, subscribed_at)
            VALUES ({command.AccountId}, {command.Endpoint}, {command.PublicKey}, {command.AuthSecret}, {subscribedAt})
            ON CONFLICT (endpoint) DO UPDATE SET
                account_id = excluded.account_id,
                public_key = excluded.public_key,
                auth_secret = excluded.auth_secret,
                subscribed_at = excluded.subscribed_at
            """,
            ct
        );
    }

    public Task UnsubscribeAsync(int accountId, string endpoint, CancellationToken ct) =>
        _dbContext
            .PushSubscriptions.Where(subscription =>
                subscription.AccountId == accountId && subscription.Endpoint == endpoint
            )
            .ExecuteDeleteAsync(ct);
}
