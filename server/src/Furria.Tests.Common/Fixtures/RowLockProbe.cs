using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Fixtures;

public static class RowLockProbe
{
    private static readonly TimeSpan QueueTimeout = TimeSpan.FromSeconds(10);

    public static Task<T> WhileBeerPotIsLockedAsync<T>(
        this ApiTestFixture fixture,
        int beerPotId,
        int waitingSessions,
        Func<Task<T>> act,
        CancellationToken ct
    ) =>
        fixture.WhileRowIsLockedAsync(
            $"SELECT id AS \"Value\" FROM beer_pot WHERE id = {beerPotId} FOR UPDATE",
            waitingSessions,
            act,
            ct
        );

    public static Task<T> WhilePersonIsLockedAsync<T>(
        this ApiTestFixture fixture,
        int personId,
        int waitingSessions,
        Func<Task<T>> act,
        CancellationToken ct
    ) =>
        fixture.WhileRowIsLockedAsync(
            $"SELECT id AS \"Value\" FROM person WHERE id = {personId} FOR UPDATE",
            waitingSessions,
            act,
            ct
        );

    private static async Task<T> WhileRowIsLockedAsync<T>(
        this ApiTestFixture fixture,
        FormattableString lockQuery,
        int waitingSessions,
        Func<Task<T>> act,
        CancellationToken ct
    )
    {
        await using var scope = fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Task<T> acting;
        await using (var transaction = await dbContext.Database.BeginTransactionAsync(ct))
        {
            await dbContext.Database.SqlQuery<int>(lockQuery).ToListAsync(ct);
            acting = act();
            await Polling.UntilAsync(
                async probeCt =>
                    await BlockedSessionsAsync(fixture, probeCt) >= waitingSessions
                        ? "queued"
                        : null,
                QueueTimeout,
                "The requests never queued behind the row lock",
                ct
            );
            await transaction.CommitAsync(ct);
        }

        return await acting;
    }

    private static async Task<int> BlockedSessionsAsync(
        ApiTestFixture fixture,
        CancellationToken ct
    )
    {
        await using var scope = fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await dbContext
            .Database.SqlQuery<int>(
                $"""
                SELECT count(DISTINCT locks.pid)::int AS "Value"
                FROM pg_locks locks
                JOIN pg_stat_activity activity ON activity.pid = locks.pid
                WHERE NOT locks.granted AND activity.datname = current_database()
                """
            )
            .SingleAsync(ct);
    }
}
