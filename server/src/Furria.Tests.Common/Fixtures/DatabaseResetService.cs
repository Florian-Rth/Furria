using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Npgsql;

namespace Furria.Tests.Common.Fixtures;

// Owned database reset — replaces Respawn. The truncate set is derived from the EF model (never
// information_schema, which would surface TimescaleDB chunk tables and anything else EF doesn't
// own) and run as a single TRUNCATE ... CASCADE *without* RESTART IDENTITY, so sequences keep
// climbing and domain ids stay non-deterministic. Rows of the snapshot entity types (seeded
// singletons such as identity roles, role-claims, a protected admin and its child rows) are
// captured once at init and re-inserted verbatim after each truncate — no live reseed, no
// password hashing, so a reset costs a few milliseconds. Truncate and restore run in one
// transaction so an interrupted reset can never leave a half-restored baseline.
//
// Pass every DbContext whose tables must be truncated (all are assumed to share one connection
// string — one container, one database) plus the CLR entity types whose rows are
// snapshot-restored, in FK-safe order (parents before children).
// Capture the snapshot at fixture init, when the database holds exactly the seeded singletons
// and no test data — an unfiltered SELECT then captures only those rows.
public sealed class DatabaseResetService
{
    private const string MigrationsHistoryTable = "__EFMigrationsHistory";

    private readonly string _connectionString;
    private readonly string _truncateStatement;
    private readonly IReadOnlyList<SingletonTable> _singletons;

    private DatabaseResetService(
        string connectionString,
        string truncateStatement,
        IReadOnlyList<SingletonTable> singletons
    )
    {
        _connectionString = connectionString;
        _truncateStatement = truncateStatement;
        _singletons = singletons;
    }

    public static async Task<DatabaseResetService> CreateAsync(
        IReadOnlyList<DbContext> contexts,
        IReadOnlyList<Type> snapshotEntityTypes,
        CancellationToken ct
    )
    {
        var connectionString =
            contexts[0].Database.GetConnectionString()
            ?? throw new InvalidOperationException("The first DbContext has no connection string.");

        var models = contexts.Select(context => context.Model).ToArray();
        var tables = BuildTruncateTableList(models);
        // An empty EF model would otherwise yield "TRUNCATE TABLE ;" - invalid SQL. Harmless
        // no-op guard until the first real entity lands.
        var truncate =
            tables.Count == 0
                ? string.Empty
                : $"TRUNCATE TABLE {string.Join(", ", tables)} CASCADE;";

        var singletons = await CaptureSingletonsAsync(
            models,
            connectionString,
            snapshotEntityTypes,
            ct
        );

        return new DatabaseResetService(connectionString, truncate, singletons);
    }

    public async Task ResetAsync(CancellationToken ct)
    {
        if (_truncateStatement.Length == 0 && _singletons.Count == 0)
            return;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        await using var transaction = await connection.BeginTransactionAsync(ct);

        if (_truncateStatement.Length > 0)
        {
            await using var truncate = connection.CreateCommand();
            truncate.Transaction = transaction;
            truncate.CommandText = _truncateStatement;
            await truncate.ExecuteNonQueryAsync(ct);
        }

        foreach (var table in _singletons)
        {
            await RestoreAsync(connection, transaction, table, ct);
        }

        await transaction.CommitAsync(ct);
    }

    private static IReadOnlyList<string> BuildTruncateTableList(params IModel[] models)
    {
        return models
            .SelectMany(model => model.GetEntityTypes())
            .Where(entityType => entityType.GetTableName() != MigrationsHistoryTable)
            .Select(QualifiedTableName)
            .OfType<string>()
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    private static string? QualifiedTableName(IEntityType entityType)
    {
        var table = entityType.GetTableName();
        if (table is null)
            return null;

        var schema = entityType.GetSchema() ?? "public";
        return $"\"{schema}\".\"{table}\"";
    }

    private static async Task<IReadOnlyList<SingletonTable>> CaptureSingletonsAsync(
        IReadOnlyList<IModel> models,
        string connectionString,
        IReadOnlyList<Type> snapshotEntityTypes,
        CancellationToken ct
    )
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(ct);

        var captured = new List<SingletonTable>();
        foreach (var clrType in snapshotEntityTypes)
        {
            var table =
                QualifiedTableName(RequireEntityType(models, clrType))
                ?? throw new InvalidOperationException($"{clrType.Name} is not mapped to a table.");
            captured.Add(await CaptureTableAsync(connection, table, ct));
        }

        return captured;
    }

    private static async Task<SingletonTable> CaptureTableAsync(
        DbConnection connection,
        string table,
        CancellationToken ct
    )
    {
        await using var command = connection.CreateCommand();
        // SELECT * is intentional: this is a generic row copier that must round-trip every column
        // (including any not on the CLR model). Snapshot tables must have no GENERATED ALWAYS or
        // computed columns, so every column read back is also insertable.
        command.CommandText = $"SELECT * FROM {table};";

        await using var reader = await command.ExecuteReaderAsync(ct);
        var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToList();

        var rows = new List<object?[]>();
        while (await reader.ReadAsync(ct))
        {
            var values = new object?[reader.FieldCount];
            reader.GetValues(values!);
            rows.Add(values);
        }

        return new SingletonTable(table, columns, rows);
    }

    private static async Task RestoreAsync(
        DbConnection connection,
        DbTransaction transaction,
        SingletonTable table,
        CancellationToken ct
    )
    {
        if (table.Rows.Count == 0)
            return;

        var columnList = string.Join(", ", table.Columns.Select(column => $"\"{column}\""));

        foreach (var row in table.Rows)
        {
            await using var command = connection.CreateCommand();
            command.Transaction = transaction;
            var parameters = row.Select((_, index) => $"@p{index}");
            command.CommandText =
                $"INSERT INTO {table.Name} ({columnList}) VALUES ({string.Join(", ", parameters)});";

            for (var index = 0; index < row.Length; index++)
            {
                command.Parameters.Add(
                    new NpgsqlParameter($"p{index}", row[index] ?? DBNull.Value)
                );
            }

            await command.ExecuteNonQueryAsync(ct);
        }
    }

    private static IEntityType RequireEntityType(IReadOnlyList<IModel> models, Type clrType) =>
        models
            .Select(model => model.FindEntityType(clrType))
            .FirstOrDefault(entityType => entityType is not null)
        ?? throw new InvalidOperationException($"{clrType.Name} is not part of any EF model.");

    private sealed record SingletonTable(
        string Name,
        IReadOnlyList<string> Columns,
        IReadOnlyList<object?[]> Rows
    );
}
