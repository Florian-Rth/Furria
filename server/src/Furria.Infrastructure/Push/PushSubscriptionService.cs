using Furria.Application.Push;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Push;

public sealed class PushSubscriptionService
{
    public const int MaxDevicesPerAccount = 10;

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
            WHERE (push_subscription.account_id, push_subscription.public_key, push_subscription.auth_secret)
                IS DISTINCT FROM (excluded.account_id, excluded.public_key, excluded.auth_secret)
            """,
            ct
        );
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            DELETE FROM push_subscription
            WHERE account_id = {command.AccountId}
              AND id NOT IN (
                SELECT id FROM push_subscription
                WHERE account_id = {command.AccountId}
                ORDER BY subscribed_at DESC, id DESC
                LIMIT {MaxDevicesPerAccount}
              )
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
