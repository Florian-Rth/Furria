using Furria.Application.Identity;
using Furria.Application.PreviewAccess;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Expectations;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Time.Testing;
using Testcontainers.PostgreSql;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string SigningKey = "furria-test-signing-key-of-at-least-32-bytes";
    private const string Issuer = "furria-api-tests";
    private const string Audience = "furria-clients";
    private const string NotInitialized = "ApiTestFixture has not been initialized yet.";

    public const string PreviewPassword = "test-preview-password";
    public const string BootstrapAdminEmail = "bootstrap-admin@test.local";
    public const string BootstrapAdminPassword = "Bootstrap-Admin-Pw-1!";
    public const string SeededAccountPassword = "Seeded-Account-Pw-1!";

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder(
        "postgres:18-alpine"
    ).Build();

    private DatabaseResetService? _resetService;
    private SeededAccount? _bootstrapAdmin;

    public FakeTimeProvider TimeProvider { get; } = new(WholeSecondNow());

    public DateOnly Today => ClubClock.Today(TimeProvider);

    public int CurrentSessionYear => ClubSession.YearOf(Today);

    public SeededAccount BootstrapAdmin =>
        _bootstrapAdmin ?? throw new InvalidOperationException(NotInitialized);

    private static DateTimeOffset WholeSecondNow()
    {
        var now = DateTimeOffset.UtcNow;
        return now.AddTicks(-(now.Ticks % TimeSpan.TicksPerSecond));
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting(
            $"ConnectionStrings:{AppDbContext.ConnectionName}",
            _postgres.GetConnectionString()
        );
        builder.UseSetting(
            $"{PreviewAccessOptions.SectionName}:{nameof(PreviewAccessOptions.Password)}",
            PreviewPassword
        );
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.SigningKey)}",
            SigningKey
        );
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.Issuer)}",
            Issuer
        );
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.Audience)}",
            Audience
        );
        builder.UseSetting(
            $"{BootstrapAdminOptions.SectionName}:{nameof(BootstrapAdminOptions.Email)}",
            BootstrapAdminEmail
        );
        builder.UseSetting(
            $"{BootstrapAdminOptions.SectionName}:{nameof(BootstrapAdminOptions.Password)}",
            BootstrapAdminPassword
        );
        builder.UseSetting(
            $"{BootstrapAdminOptions.SectionName}:{nameof(BootstrapAdminOptions.FirstName)}",
            "Bootstrap"
        );
        builder.UseSetting(
            $"{BootstrapAdminOptions.SectionName}:{nameof(BootstrapAdminOptions.LastName)}",
            "Admin"
        );
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(TimeProvider);
        });
    }

    public async ValueTask InitializeAsync()
    {
        await _postgres.StartAsync();

        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var admin = await db
            .Users.AsNoTracking()
            .Where(account => account.Email == BootstrapAdminEmail)
            .Select(account => new { account.Id, account.PersonId })
            .SingleAsync();

        _bootstrapAdmin = new SeededAccount(
            admin.Id,
            admin.PersonId,
            BootstrapAdminEmail,
            BootstrapAdminPassword
        );

        _resetService = await DatabaseResetService.CreateAsync(
            [db],
            [typeof(Person), typeof(Account)],
            CancellationToken.None
        );
    }

    public Task<SeededContext> BuildAsync(CancellationToken ct = default) =>
        BuildAsync(_ => { }, ct);

    public async Task<SeededContext> BuildAsync(
        Action<SeedContextBuilder> configure,
        CancellationToken ct = default
    )
    {
        await ResetDatabaseAsync(ct);

        var recorded = new SeedContextBuilder();
        configure(recorded);

        var scopeFactory = Services.GetRequiredService<IServiceScopeFactory>();
        var seeded = await IdentitySeedMaterializer.MaterializeAsync(
            scopeFactory,
            recorded.RecordedIdentity,
            SeededAccountPassword,
            ct
        );

        var identity = new TestIdentity(
            CreateClient,
            seeded,
            BootstrapAdmin,
            SeededAccountPassword
        );
        return new SeededContext(identity, new Expected(scopeFactory));
    }

    public async Task RunBootstrapSeederAsync(CancellationToken ct = default)
    {
        var seeder = Services.GetServices<IHostedService>().OfType<BootstrapAdminSeeder>().Single();
        await seeder.StartAsync(ct);
    }

    public async Task EditPersonNameDirectlyAsync(
        int personId,
        string firstName,
        string lastName,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var person = await db.People.SingleAsync(row => row.Id == personId, ct);
        person.FirstName = firstName;
        person.LastName = lastName;
        await db.SaveChangesAsync(ct);
    }

    public async Task DisableAccountDirectlyAsync(int accountId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"UPDATE account SET is_disabled = TRUE WHERE id = {accountId}",
            ct
        );
    }

    public async Task<IReadOnlyList<string>> GetAppliedMigrationsAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var applied = await db.Database.GetAppliedMigrationsAsync(ct);
        return applied.ToList();
    }

    public async Task ResetDatabaseAsync(CancellationToken ct = default)
    {
        if (_resetService is null)
            throw new InvalidOperationException(NotInitialized);

        await _resetService.ResetAsync(ct);
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }
}
