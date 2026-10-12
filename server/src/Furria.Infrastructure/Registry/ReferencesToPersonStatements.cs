using System.Diagnostics.Contracts;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Furria.Infrastructure.Registry;

internal static class ReferencesToPersonStatements
{
    public static Task<bool> IsReferencedByAnyBlockingAsync(
        AppDbContext dbContext,
        int personId,
        CancellationToken ct
    )
    {
        var referenced = ReferencesToPerson
            .All.Where(reference => reference.OnAbsorption == OnAbsorption.BlocksIt)
            .Select(reference => ColumnOf(dbContext.Model, reference))
            .Select(column => $"EXISTS (SELECT 1 FROM {column.Table} WHERE {column.Name} = {{0}})");
        var query = $"SELECT {string.Join(" OR ", referenced)} AS \"Value\"";

        return dbContext.Database.SqlQueryRaw<bool>(query, personId).SingleAsync(ct);
    }

    public static async Task MoveOntoKeeperAsync(
        AppDbContext dbContext,
        int strayPersonId,
        int keeperPersonId,
        CancellationToken ct
    )
    {
        foreach (var move in MoveStatementsOf(dbContext.Model))
            await dbContext.Database.ExecuteSqlRawAsync(move, [strayPersonId, keeperPersonId], ct);
    }

    [Pure]
    private static IEnumerable<string> MoveStatementsOf(IModel model) =>
        ReferencesToPerson
            .All.Select(reference =>
                MoveStatementOf(ColumnOf(model, reference), reference.OnAbsorption)
            )
            .OfType<string>();

    [Pure]
    private static string? MoveStatementOf(Column column, OnAbsorption onAbsorption) =>
        onAbsorption switch
        {
            OnAbsorption.MovesToKeeper =>
                $"UPDATE {column.Table} SET {column.Name} = {{1}} WHERE {column.Name} = {{0}}",
            OnAbsorption.MovesToKeeperUnlessSheHoldsOne =>
                $"UPDATE {column.Table} SET {column.Name} = {{1}} WHERE {column.Name} = {{0}} "
                    + $"AND NOT EXISTS (SELECT 1 FROM {column.Table} WHERE {column.Name} = {{1}})",
            _ => null,
        };

    [Pure]
    private static Column ColumnOf(IModel model, ReferenceToPerson reference)
    {
        var entityType = model.FindEntityType(reference.Entity)!;
        var table = StoreObjectIdentifier.Table(entityType.GetTableName()!, entityType.GetSchema());

        return new Column(
            Quoted(table.Name),
            Quoted(entityType.FindProperty(reference.Property)!.GetColumnName(table)!)
        );
    }

    [Pure]
    private static string Quoted(string identifier) => $"\"{identifier}\"";

    private sealed record Column(string Table, string Name);
}
