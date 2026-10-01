using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Fixtures;

public sealed class RejectedWrites : IAsyncDisposable
{
    private const string Trigger = "furria_test_reject_writes";

    private readonly WebApplicationFactory<Program> _host;
    private readonly string _table;

    private RejectedWrites(WebApplicationFactory<Program> host, string table)
    {
        _host = host;
        _table = table;
    }

    public static async Task<RejectedWrites> OnAsync(
        WebApplicationFactory<Program> host,
        string table,
        CancellationToken ct
    )
    {
        await ExecuteAsync(
            host,
            $"""
            CREATE FUNCTION {Trigger}() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN RAISE EXCEPTION 'write rejected by the test'; END $$;
            CREATE TRIGGER {Trigger} BEFORE INSERT OR UPDATE OR DELETE ON {table}
            FOR EACH ROW EXECUTE FUNCTION {Trigger}();
            """,
            ct
        );
        return new RejectedWrites(host, table);
    }

    public async ValueTask DisposeAsync() =>
        await ExecuteAsync(
            _host,
            $"DROP TRIGGER {Trigger} ON {_table}; DROP FUNCTION {Trigger}();",
            CancellationToken.None
        );

    private static async Task ExecuteAsync(
        WebApplicationFactory<Program> host,
        string sql,
        CancellationToken ct
    )
    {
        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
#pragma warning disable EF1002
        await db.Database.ExecuteSqlRawAsync(sql, ct);
#pragma warning restore EF1002
    }
}
