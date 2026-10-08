using System.Data.Common;
using System.Diagnostics.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Npgsql;

namespace Furria.Tests.Common.Fixtures;

public sealed class DatabaseResetService
{
    private const string MigrationsHistoryTable = "__EFMigrationsHistory";
    private const string SkipForeignKeyChecks = "SET LOCAL session_replication_role = replica";

    private readonly string _connectionString;
    private readonly IReadOnlyList<string> _clearStatements;
    private readonly IReadOnlyList<SingletonTable> _singletons;

    private DatabaseResetService(
        string connectionString,
        IReadOnlyList<string> clearStatements,
        IReadOnlyList<SingletonTable> singletons
    )
    {
        _connectionString = connectionString;
        _clearStatements = clearStatements;
        _singletons = singletons;
    }

    public static async Task<DatabaseResetService> CreateAsync(
        IReadOnlyList<DbContext> contexts,
        IReadOnlyList<Type> snapshotEntityTypes,
        IReadOnlyList<Type> retainedEntityTypes,
        CancellationToken ct
    )
    {
        var connectionString =
            contexts[0].Database.GetConnectionString()
            ?? throw new InvalidOperationException("The first DbContext has no connection string.");

        var models = contexts.Select(context => context.Model).ToArray();
        var tables = ClearedTables(models, retainedEntityTypes);
        var singletons = await CaptureSingletonsAsync(
            models,
            connectionString,
            snapshotEntityTypes,
            ct
        );

        return new DatabaseResetService(connectionString, ClearStatements(tables), singletons);
    }

    public async Task ResetAsync(CancellationToken ct)
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        await using var transaction = await connection.BeginTransactionAsync(ct);
        await using var batch = new NpgsqlBatch(connection, transaction);

        foreach (var statement in _clearStatements)
            batch.BatchCommands.Add(new NpgsqlBatchCommand(statement));
        foreach (var table in _singletons.Where(table => table.Rows.Count > 0))
            batch.BatchCommands.Add(RestoreCommand(table));

        await batch.ExecuteNonQueryAsync(ct);
        await transaction.CommitAsync(ct);
    }

    [Pure]
    private static IReadOnlyList<string> ClearedTables(
        IReadOnlyList<IModel> models,
        IReadOnlyList<Type> retainedEntityTypes
    ) =>
        models
            .SelectMany(model => model.GetEntityTypes())
            .Where(entityType => entityType.GetTableName() != MigrationsHistoryTable)
            .Where(entityType => !retainedEntityTypes.Contains(entityType.ClrType))
            .Select(QualifiedTableName)
            .OfType<string>()
            .Distinct(StringComparer.Ordinal)
            .ToList();

    [Pure]
    private static IReadOnlyList<string> ClearStatements(IReadOnlyList<string> tables) =>
        [SkipForeignKeyChecks, .. tables.Select(table => $"DELETE FROM {table}")];

    [Pure]
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

    [Pure]
    private static NpgsqlBatchCommand RestoreCommand(SingletonTable table)
    {
        var columnList = string.Join(", ", table.Columns.Select(column => $"\"{column}\""));
        var width = table.Columns.Count;
        var rowLists = table.Rows.Select(
            (_, row) =>
                $"({string.Join(", ", Enumerable.Range(row * width + 1, width).Select(index => $"${index}"))})"
        );

        var command = new NpgsqlBatchCommand(
            $"INSERT INTO {table.Name} ({columnList}) VALUES {string.Join(", ", rowLists)}"
        );
        foreach (var value in table.Rows.SelectMany(row => row))
            command.Parameters.Add(new NpgsqlParameter { Value = value ?? DBNull.Value });

        return command;
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
