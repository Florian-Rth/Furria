using System.Globalization;
using Furria.Api.Altcha;
using Furria.Api.Proxies;
using Furria.Api.RateLimiting;
using Furria.Application.Club;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Mail;
using Furria.Application.Media;
using Furria.Application.PreviewAccess;
using Furria.Application.Results;
using Furria.Application.Website;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.Roles;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.MediaWorker;
using Furria.MediaWorker.Jobs;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Expectations;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Serilog.Core;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string SigningKey = "furria-test-signing-key-of-at-least-32-bytes";
    private const string Issuer = "furria-api-tests";
    private const string Audience = "furria-clients";
    private const string NotInitialized = "ApiTestFixture has not been initialized yet.";
    private const string AdminRoleName = "Admin";
    private const string ForeignKeysQuery = """
        SELECT constraint_row.conname,
               referencing.relname,
               referenced.relname,
               CASE constraint_row.confdeltype
                   WHEN 'c' THEN 'CASCADE'
                   WHEN 'n' THEN 'SET NULL'
                   WHEN 'd' THEN 'SET DEFAULT'
                   WHEN 'r' THEN 'RESTRICT'
                   ELSE 'NO ACTION'
               END
        FROM pg_constraint constraint_row
        JOIN pg_class referencing ON referencing.oid = constraint_row.conrelid
        JOIN pg_class referenced ON referenced.oid = constraint_row.confrelid
        JOIN pg_namespace schema_row ON schema_row.oid = constraint_row.connamespace
        WHERE constraint_row.contype = 'f' AND schema_row.nspname = current_schema()
        """;

    public const string PreviewPassword = "test-preview-password";
    public const string ManagingLoginEmail = "managing-login@test.local";
    public const string ManagingLoginPassword = "Managing-Login-Pw-1!";
    public const string SeededAccountPassword = "Seeded-Account-Pw-1!";
    public const string ClubDomain = "furria.test";
    public const string ClubAppBaseUrl = "https://club.furria.test";
    public const string WebsiteBaseUrl = "https://furria.test";
    public const string AndroidCertFingerprint =
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5";
    public const int PermitsPerInvitationToken = 10;
    public const string TrustedProxyAddress = "10.10.20.1";

    private const string AltchaHmacKey = "furria-test-altcha-hmac-key-of-32-bytes";
    private const string MediaSigningKey = "furria-test-media-signing-key-of-32-bytes";
    private const int AltchaCost = 1;
    private const int AltchaMinCounter = 1;
    private const int AltchaMaxCounter = 50;
    private const int PermitsPerIpBeyondAnySuite = 1_000_000;
    private const int PasswordHashIterations = 1;

    private static readonly TimeSpan SignedOutWorkTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan OutboxDrainTimeout = TimeSpan.FromSeconds(20);

    private readonly ApiTestInfrastructure _infrastructure;

    private readonly string _mediaRoot = Path.Combine(
        Path.GetTempPath(),
        "furria-tests-media",
        Guid.NewGuid().ToString("N")
    );

    private string? _database;
    private ServiceProvider? _mediaWorker;
    private DatabaseResetService? _resetService;
    private SeededManagingLogin? _managingLogin;
    private int? _adminRoleId;

    private string Database => _database ?? throw new InvalidOperationException(NotInitialized);

    private ServiceProvider MediaWorker => _mediaWorker ??= BuildMediaWorker();

    public TestClock TimeProvider { get; } = new(WholeSecondNow());

    public CapturingLogSink Logs { get; } = new();

    public LogMark HostStarted { get; private set; }

    public DateOnly Today => ClubClock.Today(TimeProvider);

    public int CurrentSessionYear => ClubSession.YearOf(Today);

    public SeededManagingLogin ManagingLogin =>
        _managingLogin ?? throw new InvalidOperationException(NotInitialized);

    public int AdminRoleId => _adminRoleId ?? throw new InvalidOperationException(NotInitialized);

    public MailpitInbox Mailbox => _infrastructure.Mailbox;

    public string MediaRoot => _mediaRoot;

    public ApiTestFixture(ApiTestInfrastructure infrastructure)
    {
        _infrastructure = infrastructure;
    }

    private ServiceProvider BuildMediaWorker()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        var configuration = Services.GetRequiredService<IConfiguration>();
        services.AddSingleton(configuration);
        services.AddSingleton<TimeProvider>(TimeProvider);
        services.AddMediaWorker(configuration);
        return services.BuildServiceProvider();
    }

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
        builder.UseSetting($"ConnectionStrings:{AppDbContext.ConnectionName}", Database);
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
            $"{ManagingLoginOptions.SectionName}:{nameof(ManagingLoginOptions.Email)}",
            ManagingLoginEmail
        );
        builder.UseSetting(
            $"{ManagingLoginOptions.SectionName}:{nameof(ManagingLoginOptions.Password)}",
            ManagingLoginPassword
        );
        builder.UseSetting(
            $"{MailOptions.SectionName}:{nameof(MailOptions.Host)}",
            _infrastructure.MailpitHost
        );
        builder.UseSetting(
            $"{MailOptions.SectionName}:{nameof(MailOptions.Port)}",
            _infrastructure.MailpitSmtpPublicPort.ToString(CultureInfo.InvariantCulture)
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
            $"{WebsiteOptions.SectionName}:{nameof(WebsiteOptions.BaseUrl)}",
            WebsiteBaseUrl
        );
        builder.UseSetting(
            $"{PasskeyOptions.SectionName}:{nameof(PasskeyOptions.RelyingPartyId)}",
            ClubDomain
        );
        builder.UseSetting(
            $"{ClubAppOptions.SectionName}:{nameof(ClubAppOptions.AndroidCertFingerprints)}:0",
            AndroidCertFingerprint
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}",
            PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerToken)}",
            PermitsPerInvitationToken.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.FailedLoginsPerIp)}",
            PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.RejectedRefreshesPerIp)}",
            PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.HmacKey)}",
            AltchaHmacKey
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.Cost)}",
            AltchaCost.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.MinCounter)}",
            AltchaMinCounter.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.MaxCounter)}",
            AltchaMaxCounter.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{MediaOptions.SectionName}:{nameof(MediaOptions.RootPath)}",
            _mediaRoot
        );
        builder.UseSetting(
            $"{MediaOptions.SectionName}:{nameof(MediaOptions.SigningKey)}",
            MediaSigningKey
        );
        builder.UseSetting(
            $"{TrustedProxyOptions.SectionName}:{nameof(TrustedProxyOptions.TrustedProxies)}:0",
            TrustedProxyAddress
        );
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(TimeProvider);
            services.AddSingleton<ILogEventSink>(Logs);
            services.Configure<PasswordHasherOptions>(options =>
                options.IterationCount = PasswordHashIterations
            );
        });
    }

    public async ValueTask InitializeAsync()
    {
        _database = await _infrastructure.CreateDatabaseFromTemplateAsync();

        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var managingLoginId = await db
            .Users.AsNoTracking()
            .Where(account => account.IsManagingLogin)
            .Select(account => account.Id)
            .SingleAsync();

        _managingLogin = new SeededManagingLogin(
            managingLoginId,
            ManagingLoginEmail,
            ManagingLoginPassword
        );

        _adminRoleId = await db
            .Roles.AsNoTracking()
            .Where(role => role.Name == AdminRoleName)
            .Select(role => role.Id)
            .SingleAsync();

        HostStarted = Logs.Mark();
        _resetService = await DatabaseResetService.CreateAsync(
            [db],
            [typeof(Account), typeof(Role), typeof(RolePermission)],
            [typeof(DataProtectionKey)],
            CancellationToken.None
        );
    }

    public WebApplicationFactory<Program> HostWithSettings(
        IReadOnlyDictionary<string, string> settings
    ) =>
        WithWebHostBuilder(builder =>
        {
            foreach (var (key, value) in settings)
                builder.UseSetting(key, value);
        });

    public WebApplicationFactory<Program> HostOnDatabase(string connectionString) =>
        WithWebHostBuilder(builder =>
        {
            builder.UseSetting(
                $"ConnectionStrings:{AppDbContext.ConnectionName}",
                connectionString
            );
            builder.ConfigureTestServices(RemoveDatabaseStartup);
        });

    private static void RemoveDatabaseStartup(IServiceCollection services)
    {
        var databaseStartup = services
            .Where(descriptor =>
                descriptor.ImplementationType == typeof(DatabaseMigrator)
                || descriptor.ImplementationType == typeof(ManagingLoginSeeder)
            )
            .ToList();
        foreach (var descriptor in databaseStartup)
            services.Remove(descriptor);
    }

    public async Task<WebApplicationFactory<Program>> HostOnOwnDatabaseAsync(
        IReadOnlyDictionary<string, string> settings,
        CancellationToken ct = default
    )
    {
        var database = await CreateEmptyDatabaseAsync(ct);
        return WithWebHostBuilder(builder =>
        {
            builder.UseSetting($"ConnectionStrings:{AppDbContext.ConnectionName}", database);
            foreach (var (key, value) in settings)
                builder.UseSetting(key, value);
        });
    }

    public static async Task<string> SeedAccountOnAsync(
        WebApplicationFactory<Program> host,
        string alias,
        CancellationToken ct = default
    )
    {
        var recorded = new SeedContextBuilder();
        recorded.Identity(identity => identity.AddAccount(alias));

        var seeded = await SeedMaterializer.MaterializeAsync(
            host.Services.GetRequiredService<IServiceScopeFactory>(),
            recorded,
            SeededAccountPassword,
            ct
        );
        return seeded.Identity.AccountEmails[alias];
    }

    public static async Task<IReadOnlyList<OutboxMail>> OutboxOfAsync(
        WebApplicationFactory<Program> host,
        CancellationToken ct = default
    )
    {
        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.OutboxMails.AsNoTracking().OrderBy(mail => mail.Id).ToListAsync(ct);
    }

    public static async Task StageOutboxMailAsync(
        WebApplicationFactory<Program> host,
        OutboxMail mail,
        CancellationToken ct = default
    )
    {
        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.OutboxMails.Add(mail);
        await db.SaveChangesAsync(ct);
    }

    public Task OutboxDrainedAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                return await db.OutboxMails.AnyAsync(token) ? null : db;
            },
            OutboxDrainTimeout,
            "The mail outbox still holds mail",
            ct
        );

    public Task<string> CreateEmptyDatabaseAsync(CancellationToken ct = default) =>
        _infrastructure.CreateEmptyDatabaseAsync(ct);

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
            ManagingLogin,
            SeededAccountPassword
        );
        return new SeededContext(
            identity,
            new TestGroups(seeded.Groups),
            new TestRoles(seeded.Roles),
            new TestClub(seeded.Club),
            new TestGallery(seeded.Gallery),
            new Expected(scopeFactory)
        );
    }

    public async Task RunManagingLoginSeederAsync(CancellationToken ct = default)
    {
        var seeder = Services.GetServices<IHostedService>().OfType<ManagingLoginSeeder>().Single();
        await seeder.StartAsync(ct);
    }

    public Task RunDatabaseMigratorAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<DatabaseMigrator>().Single().StartAsync(ct);

    public Task RunManagingLoginSeederAsync(
        ManagingLoginOptions options,
        CancellationToken ct = default
    ) =>
        new ManagingLoginSeeder(
            Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(options),
            Services.GetRequiredService<ILogger<ManagingLoginSeeder>>()
        ).StartAsync(ct);

    public async Task DeleteAccountDirectlyAsync(int accountId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync($"DELETE FROM account WHERE id = {accountId}", ct);
    }

    public async Task DeleteMediaItemDirectlyAsync(int mediaItemId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync($"DELETE FROM media_item WHERE id = {mediaItemId}", ct);
    }

    public async Task<string> MediaFileOfAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var storageKey = await db
            .MediaItems.Where(item => item.Id == mediaItemId)
            .Select(item => item.StorageKey)
            .SingleAsync(ct);
        return Path.Combine(_mediaRoot, MediaPaths.RenditionOf(storageKey, rendition));
    }

    public async Task PlaceRenditionAsync(
        int mediaItemId,
        MediaRendition rendition,
        byte[] content,
        CancellationToken ct = default
    )
    {
        var path = await MediaFileOfAsync(mediaItemId, rendition, ct);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllBytesAsync(path, content, ct);
    }

    public async Task RunMediaWorkerAsync(CancellationToken ct = default)
    {
        var runner = MediaWorker.GetRequiredService<MediaJobRunner>();
        while (
            await runner.RunNextAsync(MediaKind.Photo, ct)
            | await runner.RunNextAsync(MediaKind.Video, ct)
        ) { }
    }

    public async Task<bool> ClaimMediaJobAsync(MediaKind kind, CancellationToken ct = default)
    {
        await using var scope = MediaWorker.CreateAsyncScope();
        var queue = scope.ServiceProvider.GetRequiredService<MediaJobQueue>();
        return await queue.ClaimAsync(kind, ct) is not null;
    }

    public async Task<int> RegenerateMediaAsync(
        RegenerateMediaCommand command,
        CancellationToken ct = default
    )
    {
        await using var scope = MediaWorker.CreateAsyncScope();
        var queue = scope.ServiceProvider.GetRequiredService<MediaJobQueue>();
        return await queue.RegenerateAsync(command, ct);
    }

    public async Task CropMediaItemDirectlyAsync(
        int mediaItemId,
        MediaCrop crop,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var item = await db.MediaItems.SingleAsync(row => row.Id == mediaItemId, ct);
        item.Crop = crop;
        await db.SaveChangesAsync(ct);
    }

    public async Task RenderMediaItemDirectlyAsync(int mediaItemId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var item = await db.MediaItems.SingleAsync(row => row.Id == mediaItemId, ct);
        item.State = MediaItemState.Ready;
        item.Width = 800;
        item.Height = 1000;
        item.RenderedAt = TimeProvider.GetUtcNow();
        item.Crop ??= new MediaCrop
        {
            Left = 0,
            Top = 0,
            Width = 1,
            Height = 1,
        };
        db.MediaJobs.RemoveRange(db.MediaJobs.Where(job => job.MediaItemId == mediaItemId));
        await db.SaveChangesAsync(ct);
    }

    public void SweepAbandonedUploads() =>
        Services.GetServices<IHostedService>().OfType<AbandonedUploadSweep>().Single().Sweep();

    public Task PurgeGalleryBinAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<GalleryBinPurge>().Single().PurgeAsync(ct);

    public string SignedMediaUrl(int mediaItemId, MediaOwner owner, MediaRendition rendition) =>
        Services.GetRequiredService<MediaUrlSigner>().UrlOf(mediaItemId, owner, rendition);

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

    public Task<IReadOnlyList<string>> GetAppliedMigrationsAsync(CancellationToken ct = default) =>
        AppliedMigrationsOfAsync(this, ct);

    public static async Task<IReadOnlyList<string>> AppliedMigrationsOfAsync(
        WebApplicationFactory<Program> host,
        CancellationToken ct = default
    )
    {
        await using var scope = host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var applied = await db.Database.GetAppliedMigrationsAsync(ct);
        return applied.ToList();
    }

    public async Task<IReadOnlyList<SchemaForeignKey>> ForeignKeysAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = ForeignKeysQuery;
        await using var reader = await command.ExecuteReaderAsync(ct);

        var foreignKeys = new List<SchemaForeignKey>();
        while (await reader.ReadAsync(ct))
            foreignKeys.Add(
                new SchemaForeignKey(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3)
                )
            );

        return foreignKeys;
    }

    public async Task ResetDatabaseAsync(CancellationToken ct = default)
    {
        if (_resetService is null)
            throw new InvalidOperationException(NotInitialized);

        await Polling.UntilAsync(
            _ =>
                Task.FromResult(
                    Services.GetRequiredService<SignedOutMailRequestQueue>()
                        is { IsIdle: true } queue
                        ? queue
                        : null
                ),
            SignedOutWorkTimeout,
            "The signed-out requests of the previous test were never answered",
            ct
        );
        await _resetService.ResetAsync(ct);
    }

    public override async ValueTask DisposeAsync()
    {
        if (_mediaWorker is not null)
            await _mediaWorker.DisposeAsync();
        await base.DisposeAsync();
        if (_database is not null)
            await _infrastructure.DropDatabaseAsync(_database);
        if (Directory.Exists(_mediaRoot))
            Directory.Delete(_mediaRoot, recursive: true);
    }
}
