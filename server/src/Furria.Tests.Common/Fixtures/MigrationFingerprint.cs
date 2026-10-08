using System.Collections;
using System.Diagnostics.Contracts;
using System.Globalization;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Migrations;

namespace Furria.Tests.Common.Fixtures;

internal static class MigrationFingerprint
{
    private const int Length = 16;
    private const int MaxDepth = 16;

    private static readonly string ActiveProvider = typeof(NpgsqlMigrationsSqlGenerator)
        .Assembly.GetName()
        .Name!;

    [Pure]
    public static string OfAppDbContext()
    {
        var description = new StringBuilder();
        foreach (var (id, type) in AppMigrations())
        {
            description.Append(id).Append('\n');
            Describe(UpOperationsOf(type), description, depth: 0);
            description.Append('\n');
        }

        return Convert.ToHexStringLower(
            SHA256.HashData(Encoding.UTF8.GetBytes(description.ToString()))
        )[..Length];
    }

    [Pure]
    private static IEnumerable<(string Id, Type Type)> AppMigrations() =>
        typeof(AppDbContext)
            .Assembly.GetTypes()
            .Where(type =>
                type.GetCustomAttribute<DbContextAttribute>()?.ContextType == typeof(AppDbContext)
            )
            .Select(type => (Id: type.GetCustomAttribute<MigrationAttribute>()?.Id, Type: type))
            .Where(migration => migration.Id is not null)
            .Select(migration => (migration.Id!, migration.Type))
            .OrderBy(migration => migration.Item1, StringComparer.Ordinal);

    private static IReadOnlyList<MigrationOperation> UpOperationsOf(Type migrationType)
    {
        var migration = (Migration)Activator.CreateInstance(migrationType)!;
        migration.ActiveProvider = ActiveProvider;
        return migration.UpOperations;
    }

    private static void Describe(object? value, StringBuilder sink, int depth)
    {
        if (depth > MaxDepth)
            throw new InvalidOperationException(
                "A migration operation nests too deeply to fingerprint."
            );

        switch (value)
        {
            case null:
                sink.Append('~');
                break;
            case string text:
                sink.Append('"').Append(text).Append('"');
                break;
            case Type type:
                sink.Append(type.FullName);
                break;
            case IFormattable or bool or char:
                sink.Append(Convert.ToString(value, CultureInfo.InvariantCulture));
                break;
            case IEnumerable items:
                DescribeItems(items, sink, depth);
                break;
            default:
                DescribeMembers(value, sink, depth);
                break;
        }
    }

    private static void DescribeItems(IEnumerable items, StringBuilder sink, int depth)
    {
        sink.Append('[');
        foreach (var item in items)
        {
            Describe(item, sink, depth + 1);
            sink.Append(',');
        }

        sink.Append(']');
    }

    private static void DescribeMembers(object value, StringBuilder sink, int depth)
    {
        sink.Append(value.GetType().Name).Append('{');
        foreach (var property in ReadableProperties(value.GetType()))
        {
            sink.Append(property.Name).Append('=');
            Describe(property.GetValue(value), sink, depth + 1);
            sink.Append(';');
        }

        if (value is IReadOnlyAnnotatable annotatable)
            foreach (var annotation in annotatable.GetAnnotations())
            {
                sink.Append('@').Append(annotation.Name).Append('=');
                Describe(annotation.Value, sink, depth + 1);
                sink.Append(';');
            }

        sink.Append('}');
    }

    [Pure]
    private static IEnumerable<PropertyInfo> ReadableProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property => property.CanRead && property.GetIndexParameters().Length == 0)
            .OrderBy(property => property.Name, StringComparer.Ordinal);
}
