using System.Data.Common;
using System.Diagnostics;
using Furria.Application.Operations;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Operations;

public sealed class DatabaseProbe
{
    private const int ShownTables = 8;
    private const int CommandTimeoutSeconds = 2;
    private const string PingSql = "SELECT 1";
    private const string ServerFactsSql = """
        SELECT current_setting('server_version'),
               pg_database_size(current_database()),
               (SELECT count(*)::int FROM pg_stat_activity WHERE datname = current_database()),
               current_setting('max_connections')::int
        """;
    private const string TablesSql = """
        SELECT relname, pg_total_relation_size(relid), n_live_tup
        FROM pg_stat_user_tables
        WHERE schemaname = current_schema()
        ORDER BY pg_total_relation_size(relid) DESC, relname
        LIMIT 8
        """;
    private const string ErrorsPerHourSql = """
        SELECT floor(extract(epoch FROM (@now - logged_at)) / 3600)::int, count(*)::int
        FROM log_entry
        WHERE level IN ('Error', 'Fatal') AND logged_at > @now - interval '24 hours' AND logged_at <= @now
        GROUP BY 1
        """;

    private static readonly TimeSpan ProbeTimeout = TimeSpan.FromSeconds(CommandTimeoutSeconds);

    private readonly AppDbContext _dbContext;

    public DatabaseProbe(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SystemDatabaseDetails> FactsAsync(CancellationToken ct)
    {
        using var probe = CancellationTokenSource.CreateLinkedTokenSource(ct);
        probe.CancelAfter(ProbeTimeout * 3);
        try
        {
            await _dbContext.Database.OpenConnectionAsync(probe.Token);
            try
            {
                return await ReadFactsAsync(probe.Token);
            }
            finally
            {
                await _dbContext.Database.CloseConnectionAsync();
            }
        }
        catch (Exception exception)
            when (exception is DbException or TimeoutException or InvalidOperationException
                || (exception is OperationCanceledException && !ct.IsCancellationRequested)
            )
        {
            return SystemDatabaseDetails.Unreachable;
        }
    }

    public async Task<IReadOnlyList<int>> ErrorsPerHourAsync(
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var buckets = new int[SystemFacts.ErrorHours];
        await using var command = CommandOf(ErrorsPerHourSql);
        var parameter = command.CreateParameter();
        parameter.ParameterName = "now";
        parameter.Value = now.ToUniversalTime();
        command.Parameters.Add(parameter);

        await _dbContext.Database.OpenConnectionAsync(ct);
        try
        {
            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var hoursAgo = reader.GetInt32(0);
                if (hoursAgo is >= 0 and < SystemFacts.ErrorHours)
                    buckets[SystemFacts.ErrorHours - 1 - hoursAgo] = reader.GetInt32(1);
            }
        }
        finally
        {
            await _dbContext.Database.CloseConnectionAsync();
        }

        return buckets;
    }

    private async Task<SystemDatabaseDetails> ReadFactsAsync(CancellationToken ct)
    {
        var latencyMs = await PingAsync(ct);
        var server = await ServerFactsAsync(ct);
        var tables = await TablesAsync(ct);
        var lastMigration = (
            await _dbContext.Database.GetAppliedMigrationsAsync(ct)
        ).LastOrDefault();
        var pending = (await _dbContext.Database.GetPendingMigrationsAsync(ct)).Count();

        return new SystemDatabaseDetails
        {
            IsReachable = true,
            LatencyMs = latencyMs,
            Version = server.Version,
            SizeBytes = server.SizeBytes,
            Connections = server.Connections,
            MaxConnections = server.MaxConnections,
            LastMigration = lastMigration,
            PendingMigrations = pending,
            Tables = tables,
        };
    }

    private async Task<int> PingAsync(CancellationToken ct)
    {
        await using var command = CommandOf(PingSql);
        var started = Stopwatch.GetTimestamp();
        await command.ExecuteScalarAsync(ct);
        return (int)Stopwatch.GetElapsedTime(started).TotalMilliseconds;
    }

    private async Task<ServerFacts> ServerFactsAsync(CancellationToken ct)
    {
        await using var command = CommandOf(ServerFactsSql);
        await using var reader = await command.ExecuteReaderAsync(ct);
        await reader.ReadAsync(ct);
        return new ServerFacts(
            reader.GetString(0),
            reader.GetInt64(1),
            reader.GetInt32(2),
            reader.GetInt32(3)
        );
    }

    private async Task<IReadOnlyList<DatabaseTableSummary>> TablesAsync(CancellationToken ct)
    {
        await using var command = CommandOf(TablesSql);
        await using var reader = await command.ExecuteReaderAsync(ct);
        var tables = new List<DatabaseTableSummary>(ShownTables);
        while (await reader.ReadAsync(ct))
            tables.Add(
                new DatabaseTableSummary
                {
                    Name = reader.GetString(0),
                    SizeBytes = reader.GetInt64(1),
                    RowEstimate = reader.GetInt64(2),
                }
            );
        return tables;
    }

    private DbCommand CommandOf(string sql)
    {
        var command = _dbContext.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;
        command.CommandTimeout = CommandTimeoutSeconds;
        return command;
    }

    private sealed record ServerFacts(
        string Version,
        long SizeBytes,
        int Connections,
        int MaxConnections
    );
}
