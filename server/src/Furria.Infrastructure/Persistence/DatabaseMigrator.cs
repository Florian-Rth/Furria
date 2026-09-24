using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Persistence;

public sealed class DatabaseMigrator : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DatabaseMigrator> _logger;

    public DatabaseMigrator(IServiceScopeFactory scopeFactory, ILogger<DatabaseMigrator> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>().Database;

        var pending = (await database.GetPendingMigrationsAsync(cancellationToken)).ToList();
        var started = Stopwatch.GetTimestamp();
        await database.MigrateAsync(cancellationToken);

        if (pending.Count == 0)
            await ReportUpToDateAsync(database, cancellationToken);
        else
            ReportApplied(pending, Stopwatch.GetElapsedTime(started));
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private void ReportApplied(IReadOnlyList<string> applied, TimeSpan elapsed) =>
        _logger.LogInformation(
            "Applied {MigrationCount} migrations from {FirstMigration} to {LastMigration} in {ElapsedMs} ms",
            applied.Count,
            applied[0],
            applied[^1],
            (long)elapsed.TotalMilliseconds
        );

    private async Task ReportUpToDateAsync(DatabaseFacade database, CancellationToken ct)
    {
        var current = (await database.GetAppliedMigrationsAsync(ct)).LastOrDefault();
        _logger.LogInformation("Database schema up to date at {CurrentMigration}", current);
    }
}
