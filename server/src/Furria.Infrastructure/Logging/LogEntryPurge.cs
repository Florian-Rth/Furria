using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Logging;

public sealed class LogEntryPurge : BackgroundService
{
    private const BackgroundJob Job = BackgroundJob.LogEntryPurge;

    private static readonly TimeSpan PurgeInterval = BackgroundJobSchedule.Every(Job);
    private static readonly TimeSpan InformationKeptFor = TimeSpan.FromDays(3);
    private static readonly TimeSpan WarningsKeptFor = TimeSpan.FromDays(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly TimeProvider _timeProvider;
    private readonly int _rowCap;
    private readonly ILogger<LogEntryPurge> _logger;

    public LogEntryPurge(
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        TimeProvider timeProvider,
        IConfiguration configuration,
        ILogger<LogEntryPurge> logger
    )
    {
        _scopeFactory = scopeFactory;
        _runs = runs;
        _timeProvider = timeProvider;
        _rowCap = SystemLogOptions.Of(configuration).RowCap;
        _logger = logger;
    }

    public async Task PurgeAsync(CancellationToken ct)
    {
        try
        {
            await _runs.TrackAsync(Job, () => PurgeExpiredAsync(ct));
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogWarning(
                "Log entries not purged, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(PurgeInterval, _timeProvider);
        do
        {
            await PurgeAsync(stoppingToken);
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task PurgeExpiredAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = _timeProvider.GetUtcNow();

        var purged =
            await DeleteAgedAsync(dbContext, now, ct) + await DeleteBeyondCapAsync(dbContext, ct);
        var forgottenWorkers = await DeleteForgottenWorkersAsync(dbContext, now, ct);

        if (purged > 0 || forgottenWorkers > 0)
            _logger.LogInformation(
                "Purged {PurgedCount} log entries and {ForgottenWorkerCount} forgotten media workers",
                purged,
                forgottenWorkers
            );
    }

    private static async Task<int> DeleteAgedAsync(
        AppDbContext dbContext,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var informationBefore = now - InformationKeptFor;
        var warningsBefore = now - WarningsKeptFor;
        return await dbContext
            .LogEntries.Where(entry =>
                entry.LoggedAt < warningsBefore
                || (entry.Level == LogEntryLevel.Information && entry.LoggedAt < informationBefore)
            )
            .ExecuteDeleteAsync(ct);
    }

    private async Task<int> DeleteBeyondCapAsync(AppDbContext dbContext, CancellationToken ct)
    {
        var newestBeyondCap = await dbContext
            .LogEntries.OrderByDescending(entry => entry.Id)
            .Skip(_rowCap)
            .Select(entry => (long?)entry.Id)
            .FirstOrDefaultAsync(ct);
        if (newestBeyondCap is not { } cutoff)
            return 0;

        return await dbContext.LogEntries.Where(entry => entry.Id <= cutoff).ExecuteDeleteAsync(ct);
    }

    private static Task<int> DeleteForgottenWorkersAsync(
        AppDbContext dbContext,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var forgottenBefore = now - MediaWorkerLiveness.ForgottenAfter;
        return dbContext
            .MediaWorkerHeartbeats.Where(heartbeat => heartbeat.LastSeenAt < forgottenBefore)
            .ExecuteDeleteAsync(ct);
    }
}
