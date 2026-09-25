using System.Globalization;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Furria.Api.Logging;
using Furria.Api.RateLimiting;
using Furria.Application.Club;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Mail;
using Furria.Application.PreviewAccess;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Roles;
using Furria.Infrastructure.Club;
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
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Serilog.Core;
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
    public const string ClubAppBaseUrl = "https://club.furria.test";
    public const int PermitsPerInvitationToken = 5;

    private const int MailpitSmtpPort = 1025;
    private const int MailpitApiPort = 8025;
    private const int PermitsPerIpBeyondAnySuite = 1_000_000;

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder(
        "postgres:18-alpine"
    ).Build();

    private readonly IContainer _mailpit = new ContainerBuilder("axllent/mailpit:v1.27")
        .WithPortBinding(MailpitSmtpPort, assignRandomHostPort: true)
        .WithPortBinding(MailpitApiPort, assignRandomHostPort: true)
        .WithWaitStrategy(
            Wait.ForUnixContainer()
                .UntilInternalTcpPortIsAvailable(MailpitSmtpPort)
                .UntilHttpRequestIsSucceeded(request =>
                    request.ForPort(MailpitApiPort).ForPath("/readyz")
                )
        )
        .Build();

    private MailpitInbox? _mailbox;

    private DatabaseResetService? _resetService;
    private SeededAccount? _bootstrapAdmin;
    private int? _adminRoleId;

    public TestClock TimeProvider { get; } = new(WholeSecondNow());

    public CapturingLogSink Logs { get; } = new();

    public DateOnly Today => ClubClock.Today(TimeProvider);

    public int CurrentSessionYear => ClubSession.YearOf(Today);

    public SeededAccount BootstrapAdmin =>
        _bootstrapAdmin ?? throw new InvalidOperationException(NotInitialized);

    public int AdminRoleId => _adminRoleId ?? throw new InvalidOperationException(NotInitialized);

    public MailpitInbox Mailbox => _mailbox ?? throw new InvalidOperationException(NotInitialized);

    private static DateTimeOffset WholeSecondNow()
    {
        var now = DateTimeOffset.UtcNow;
        return now.AddTicks(-(now.Ticks % TimeSpan.TicksPerSecond));
    }

    private async Task WinTheParticipationAsync(
        int calendarEntryId,
        int groupId,
        CancellationToken ct
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.CalendarEntryGroups.Add(
            new CalendarEntryGroup { CalendarEntryId = calendarEntryId, GroupId = groupId }
        );

        await db.SaveChangesAsync(ct);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting(
            $"{ConsoleLogOptions.SectionName}:{nameof(ConsoleLogOptions.Format)}",
            nameof(ConsoleLogFormat.Off)
        );
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
        builder.UseSetting(
            $"{MailOptions.SectionName}:{nameof(MailOptions.Host)}",
            _mailpit.Hostname
        );
        builder.UseSetting(
            $"{MailOptions.SectionName}:{nameof(MailOptions.Port)}",
            _mailpit.GetMappedPublicPort(MailpitSmtpPort).ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{MailOptions.SectionName}:{nameof(MailOptions.From)}",
            "Furria Tests <no-reply@furria.test>"
        );
        builder.UseSetting(
            $"{ClubAppOptions.SectionName}:{nameof(ClubAppOptions.BaseUrl)}",
            ClubAppBaseUrl
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}",
            PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerToken)}",
            PermitsPerInvitationToken.ToString(CultureInfo.InvariantCulture)
        );
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(TimeProvider);
            services.AddSingleton<ILogEventSink>(Logs);
        });
    }

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(_postgres.StartAsync(), _mailpit.StartAsync());
        _mailbox = new MailpitInbox(
            new UriBuilder(
                Uri.UriSchemeHttp,
                _mailpit.Hostname,
                _mailpit.GetMappedPublicPort(MailpitApiPort)
            ).Uri
        );

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

        _adminRoleId = await db
            .Roles.AsNoTracking()
            .Where(role => role.Holdings.Any(holding => holding.PersonId == admin.PersonId))
            .Select(role => role.Id)
            .SingleAsync();

        _resetService = await DatabaseResetService.CreateAsync(
            [db],
            [
                typeof(Person),
                typeof(Account),
                typeof(Role),
                typeof(RolePermission),
                typeof(RoleHolding),
            ],
            CancellationToken.None
        );
    }

    public Task AtLaterTimeAsync(TimeSpan ahead, Func<Task> body) =>
        AtInstantAsync(TimeProvider.GetUtcNow().Add(ahead), body);

    public async Task AtInstantAsync(DateTimeOffset instant, Func<Task> body)
    {
        var before = TimeProvider.GetUtcNow();
        TimeProvider.SetUtcNow(instant);
        try
        {
            await body();
        }
        finally
        {
            TimeProvider.SetUtcNow(before);
        }
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
        var seeded = await SeedMaterializer.MaterializeAsync(
            scopeFactory,
            recorded,
            SeededAccountPassword,
            ct
        );

        var identity = new TestIdentity(
            CreateClient,
            seeded.Identity,
            BootstrapAdmin,
            SeededAccountPassword
        );
        return new SeededContext(
            identity,
            new TestGroups(seeded.Groups),
            new TestRoles(seeded.Roles),
            new TestClub(seeded.Club),
            new Expected(scopeFactory)
        );
    }

    public async Task RunBootstrapSeederAsync(CancellationToken ct = default)
    {
        var seeder = Services.GetServices<IHostedService>().OfType<BootstrapAdminSeeder>().Single();
        await seeder.StartAsync(ct);
    }

    public Task RunDatabaseMigratorAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<DatabaseMigrator>().Single().StartAsync(ct);

    public Task RunBootstrapSeederAsync(
        BootstrapAdminOptions options,
        CancellationToken ct = default
    ) =>
        new BootstrapAdminSeeder(
            Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(options),
            Services.GetRequiredService<ILogger<BootstrapAdminSeeder>>()
        ).StartAsync(ct);

    public async Task DeleteAccountDirectlyAsync(int accountId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync($"DELETE FROM account WHERE id = {accountId}", ct);
    }

    public async Task DeletePersonDirectlyAsync(int personId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync($"DELETE FROM person WHERE id = {personId}", ct);
    }

    public async Task AddRolePermissionDirectlyAsync(
        int roleId,
        string permissionKey,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.RolePermissions.Add(
            new RolePermission { RoleId = roleId, PermissionKey = permissionKey }
        );
        await db.SaveChangesAsync(ct);
    }

    public async Task RemoveRoleHoldingsDirectlyAsync(int roleId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync($"DELETE FROM role_holding WHERE role_id = {roleId}", ct);
    }

    public async Task EndRoleHoldingsDirectlyAsync(
        int roleId,
        DateOnly untilOn,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"UPDATE role_holding SET until_on = {untilOn} WHERE role_id = {roleId}",
            ct
        );
    }

    public async Task RemoveRolePermissionDirectlyAsync(
        int roleId,
        string permissionKey,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"DELETE FROM role_permission WHERE role_id = {roleId} AND permission_key = {permissionKey}",
            ct
        );
    }

    public async Task<Result> SaveSecondOpenGroupMembershipAsync(
        int groupId,
        int personId,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.GroupMemberships.Add(
            new GroupMembership
            {
                GroupId = groupId,
                PersonId = personId,
                JoinedOn = Today,
            }
        );

        return await db.SaveOrConflictAsync(ct);
    }

    public async Task<Result<CalendarEntryWriteResult>> SaveSecondParticipationAsync(
        int calendarEntryId,
        int groupId,
        int viewerPersonId,
        CancellationToken ct = default
    )
    {
        await using var loser = Services.CreateAsyncScope();
        var db = loser.ServiceProvider.GetRequiredService<AppDbContext>();
        var calendarService = loser.ServiceProvider.GetRequiredService<CalendarService>();

        db.CalendarEntryGroups.Add(
            new CalendarEntryGroup { CalendarEntryId = calendarEntryId, GroupId = groupId }
        );

        await WinTheParticipationAsync(calendarEntryId, groupId, ct);

        var entry = await db
            .CalendarEntries.AsNoTracking()
            .SingleAsync(row => row.Id == calendarEntryId, ct);

        return await calendarService.UpdateAsync(
            new UpdateCalendarEntryCommand
            {
                ViewerPersonId = viewerPersonId,
                CalendarEntryId = entry.Id,
                Title = entry.Title,
                Description = entry.Description,
                OwnerGroupId = entry.OwnerGroupId,
                VenueId = entry.VenueId,
                StartsAt = entry.StartsAt,
                EndsAt = entry.EndsAt,
                Kind = entry.Kind,
                Visibility = entry.Visibility,
                AsksForResponse = entry.AsksForResponse,
                ParticipatingGroupIds = [groupId],
            },
            ct
        );
    }

    public async Task<Result> SaveSecondActiveGroupAsync(
        string name,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        db.Groups.Add(new Group { Name = name, Description = string.Empty });

        return await db.SaveOrConflictAsync(ct);
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

    public async Task EditRoleNameDirectlyAsync(
        int roleId,
        string name,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = await db.Roles.SingleAsync(row => row.Id == roleId, ct);
        role.Name = name;
        await db.SaveChangesAsync(ct);
    }

    public async Task ArchiveRoleDirectlyAsync(
        int roleId,
        DateOnly archivedOn,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = await db.Roles.SingleAsync(row => row.Id == roleId, ct);
        role.ArchivedOn = archivedOn;
        await db.SaveChangesAsync(ct);
    }

    public async Task EditGroupNameDirectlyAsync(
        int groupId,
        string name,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var group = await db.Groups.SingleAsync(row => row.Id == groupId, ct);
        group.Name = name;
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
        _mailbox?.Dispose();
        await _postgres.DisposeAsync();
        await _mailpit.DisposeAsync();
    }
}
