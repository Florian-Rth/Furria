using System.Diagnostics.Contracts;
using Furria.Infrastructure;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Furria.Tests.Common.Fixtures;

internal sealed class TestDatabaseCatalog : IAsyncDisposable
{
    private const string TemplatePrefix = "furria_template_";
    private const string LanePrefix = "furria_lane";
    private const string EmptyPrefix = "furria_empty";
    private const string BuildPrefix = "furria_build";
    private const string LeasePrefix = "furria-tests";
    private const char NameSeparator = '_';
    private const string LeaseSeparator = ":";
    private const int RunIdLength = 12;
    private const long CatalogLockKey = 4_711_202_611;
    private const string CatalogDatabasesQuery = """
        SELECT datname FROM pg_database WHERE datname LIKE 'furria\_%'
        """;
    private const string LeasesQuery = $"""
        SELECT application_name FROM pg_stat_activity
        WHERE application_name LIKE '{LeasePrefix}{LeaseSeparator}%'
        """;

    private static readonly string[] OwnedPrefixes = [LanePrefix, EmptyPrefix, BuildPrefix];

    private readonly string _serverConnection;
    private readonly string _runId;
    private readonly string _templateDatabase;
    private readonly NpgsqlConnection _lease;

    private TestDatabaseCatalog(
        string serverConnection,
        string runId,
        string templateDatabase,
        NpgsqlConnection lease
    )
    {
        _serverConnection = serverConnection;
        _runId = runId;
        _templateDatabase = templateDatabase;
        _lease = lease;
    }

    public static async Task<TestDatabaseCatalog> OpenAsync(
        string serverConnection,
        CancellationToken ct
    )
    {
        var migrationHash = MigrationFingerprint.OfAppDbContext();
        var runId = Guid.NewGuid().ToString("N")[..RunIdLength];
        var lease = new NpgsqlConnection(LeaseConnection(serverConnection, runId, migrationHash));
        await lease.OpenAsync(ct);

        var catalog = new TestDatabaseCatalog(
            serverConnection,
            runId,
            TemplatePrefix + migrationHash,
            lease
        );
        await catalog.PrepareAsync(ct);
        return catalog;
    }

    public async Task<string> CreateLaneAsync(CancellationToken ct)
    {
        var name = OwnedName(LanePrefix);
        await ExecuteAsync($"CREATE DATABASE {name} TEMPLATE {_templateDatabase}", ct);
        return ConnectionStringTo(name);
    }

    public async Task<string> CreateEmptyAsync(CancellationToken ct)
    {
        var name = OwnedName(EmptyPrefix);
        await ExecuteAsync($"CREATE DATABASE {name}", ct);
        return ConnectionStringTo(name);
    }

    public async Task DropAsync(string connectionString)
    {
        await using (var connection = new NpgsqlConnection(connectionString))
            NpgsqlConnection.ClearPool(connection);

        await DropDatabaseAsync(
            new NpgsqlConnectionStringBuilder(connectionString).Database!,
            CancellationToken.None
        );
    }

    public async ValueTask DisposeAsync()
    {
        var databases = await QueryNamesAsync(CatalogDatabasesQuery, CancellationToken.None);
        foreach (var database in databases.Where(name => OwnerOf(name) == _runId))
            await DropDatabaseAsync(database, CancellationToken.None);

        await _lease.DisposeAsync();
    }

    private async Task PrepareAsync(CancellationToken ct)
    {
        await LockCatalogAsync("pg_advisory_lock", ct);
        try
        {
            await SweepAbandonedAsync(ct);
            await EnsureTemplateAsync(ct);
        }
        finally
        {
            await LockCatalogAsync("pg_advisory_unlock", CancellationToken.None);
        }
    }

    private async Task LockCatalogAsync(string function, CancellationToken ct)
    {
        await using var command = _lease.CreateCommand();
        command.CommandText = $"SELECT {function}({CatalogLockKey})";
        await command.ExecuteNonQueryAsync(ct);
    }

    private async Task SweepAbandonedAsync(CancellationToken ct)
    {
        var databases = await QueryNamesAsync(CatalogDatabasesQuery, ct);
        var leases = await QueryNamesAsync(LeasesQuery, ct);

        foreach (var database in AbandonedDatabases(databases, leases))
            await DropDatabaseAsync(database, ct);
    }

    private async Task EnsureTemplateAsync(CancellationToken ct)
    {
        var databases = await QueryNamesAsync(CatalogDatabasesQuery, ct);
        if (databases.Contains(_templateDatabase))
            return;

        var build = OwnedName(BuildPrefix);
        await ExecuteAsync($"CREATE DATABASE {build}", ct);
        await MigrateAsync(ConnectionStringTo(build), ct);
        await ExecuteAsync($"ALTER DATABASE {build} RENAME TO {_templateDatabase}", ct);
    }

    private static async Task MigrateAsync(string connectionString, CancellationToken ct)
    {
        await using (var services = MigrationServices(connectionString))
        {
            await using var scope = services.CreateAsyncScope();
            await scope
                .ServiceProvider.GetRequiredService<AppDbContext>()
                .Database.MigrateAsync(ct);
        }

        await using var migrated = new NpgsqlConnection(connectionString);
        NpgsqlConnection.ClearPool(migrated);
    }

    private static ServiceProvider MigrationServices(string connectionString) =>
        new ServiceCollection()
            .AddLogging()
            .AddInfrastructure(
                new ConfigurationBuilder()
                    .AddInMemoryCollection(
                        new Dictionary<string, string?>
                        {
                            [$"ConnectionStrings:{AppDbContext.ConnectionName}"] = connectionString,
                        }
                    )
                    .Build()
            )
            .BuildServiceProvider();

    [Pure]
    private static string LeaseConnection(
        string serverConnection,
        string runId,
        string migrationHash
    ) =>
        new NpgsqlConnectionStringBuilder(serverConnection)
        {
            ApplicationName = string.Join(LeaseSeparator, LeasePrefix, runId, migrationHash),
            Pooling = false,
        }.ConnectionString;

    [Pure]
    private static IEnumerable<string> AbandonedDatabases(
        IReadOnlyList<string> databases,
        IReadOnlyList<string> leases
    )
    {
        var leaseParts = leases.Select(lease => lease.Split(LeaseSeparator)).ToList();
        var liveRuns = leaseParts.Select(parts => parts[1]).ToHashSet(StringComparer.Ordinal);
        var liveTemplates = leaseParts
            .Select(parts => TemplatePrefix + parts[2])
            .ToHashSet(StringComparer.Ordinal);

        return databases.Where(database =>
            OwnerOf(database) is { } owner
                ? !liveRuns.Contains(owner)
                : IsTemplate(database) && !liveTemplates.Contains(database)
        );
    }

    [Pure]
    private static string? OwnerOf(string database)
    {
        var parts = database.Split(NameSeparator);
        var isOwned =
            parts.Length == 4
            && OwnedPrefixes.Contains(string.Join(NameSeparator, parts[0], parts[1]));
        return isOwned ? parts[2] : null;
    }

    [Pure]
    private static bool IsTemplate(string database) =>
        database.StartsWith(TemplatePrefix, StringComparison.Ordinal);

    private string OwnedName(string prefix) =>
        string.Join(NameSeparator, prefix, _runId, Guid.NewGuid().ToString("N"));

    private Task DropDatabaseAsync(string database, CancellationToken ct) =>
        ExecuteAsync($"DROP DATABASE IF EXISTS {database} WITH (FORCE)", ct);

    private async Task<IReadOnlyList<string>> QueryNamesAsync(string query, CancellationToken ct)
    {
        await using var connection = new NpgsqlConnection(_serverConnection);
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = query;
        await using var reader = await command.ExecuteReaderAsync(ct);

        var names = new List<string>();
        while (await reader.ReadAsync(ct))
            names.Add(reader.GetString(0));

        return names;
    }

    private async Task ExecuteAsync(string statement, CancellationToken ct)
    {
        await using var connection = new NpgsqlConnection(_serverConnection);
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = statement;
        await command.ExecuteNonQueryAsync(ct);
    }

    private string ConnectionStringTo(string database) =>
        new NpgsqlConnectionStringBuilder(_serverConnection)
        {
            Database = database,
        }.ConnectionString;
}
