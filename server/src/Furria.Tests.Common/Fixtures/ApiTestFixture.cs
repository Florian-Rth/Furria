using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;
using Testcontainers.PostgreSql;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder(
        "postgres:18-alpine"
    ).Build();

    private DatabaseResetService? _resetService;

    // Parameterless FakeTimeProvider would start at 2000-01-01 - anchor it at real "now".
    public FakeTimeProvider TimeProvider { get; } = new(DateTimeOffset.UtcNow);

    public async ValueTask InitializeAsync()
    {
        // The container must be running before Services is touched for the first time:
        // building the host triggers ConfigureWebHost, which reads the container's
        // connection string.
        await _postgres.StartAsync();

        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        _resetService = await DatabaseResetService.CreateAsync([db], [], CancellationToken.None);
    }

    public async Task ResetDatabaseAsync(CancellationToken ct = default)
    {
        if (_resetService is null)
            throw new InvalidOperationException("ApiTestFixture has not been initialized yet.");

        await _resetService.ResetAsync(ct);
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:AppDb", _postgres.GetConnectionString());
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(TimeProvider);
        });
    }
}
