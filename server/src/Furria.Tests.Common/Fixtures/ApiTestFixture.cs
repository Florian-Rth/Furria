using System.Globalization;
using Furria.Api.Altcha;
using Furria.Api.Proxies;
using Furria.Api.RateLimiting;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Mail;
using Furria.Application.Media;
using Furria.Application.Operations;
using Furria.Application.Push;
using Furria.Application.Results;
using Furria.Application.Website;
using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Halls;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Assistant;
using Furria.Infrastructure.BeerList;
using Furria.Infrastructure.Changes;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Intakes;
using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Furria.Infrastructure.Registry;
using Furria.Infrastructure.RunningOrders;
using Furria.Infrastructure.WhatsApp;
using Furria.MediaWorker;
using Furria.MediaWorker.Heartbeat;
using Furria.MediaWorker.Jobs;
using Furria.Tests.Common.Assistant;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Expectations;
using Furria.Tests.Common.Push;
using Furria.Tests.Common.WhatsApp;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Npgsql;
using Serilog.Core;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestFixture : IAsyncLifetime
{
    internal const string SigningKey = "furria-test-signing-key-of-at-least-32-bytes";
    internal const string Issuer = "furria-api-tests";
    internal const string Audience = "furria-clients";
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
    private const int AfterEveryWriteStatement = 4 | 8 | 16 | 32;
    private const string ChangeNotifyingTablesQuery = """
        SELECT table_row.relname, trigger_row.tgtype = @type
        FROM pg_trigger trigger_row
        JOIN pg_class table_row ON table_row.oid = trigger_row.tgrelid
        JOIN pg_namespace schema_row ON schema_row.oid = table_row.relnamespace
        WHERE schema_row.nspname = current_schema()
          AND NOT trigger_row.tgisinternal
          AND trigger_row.tgname = @trigger
        """;
    private const string ListeningChangeListenersQuery = """
        SELECT count(*)::integer FROM pg_stat_activity
        WHERE datname = current_database()
          AND application_name = @listener
          AND query LIKE 'LISTEN %'
        """;
    private const string CutChangeListenersQuery = """
        SELECT count(pg_terminate_backend(pid))::integer FROM pg_stat_activity
        WHERE datname = current_database() AND application_name = @listener
        """;

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

    internal const string AltchaHmacKey = "furria-test-altcha-hmac-key-of-32-bytes";
    internal const int AltchaCost = 1;
    internal const int AltchaMinCounter = 1;
    internal const int AltchaMaxCounter = 50;
    internal const int PermitsPerIpBeyondAnySuite = 1_000_000;
    internal const int PasswordHashIterations = 1;
    internal const string MediaSigningKey = "furria-test-media-signing-key-of-32-bytes";
    public const string VapidPublicKey =
        "BMhR4mFcMj4K9cYVgsAKgKIGevMvrCQLSM-Jy1kqfP4iSDlC7Pa4vNiXYZKmTo4mclU-aq_1BFfX8QuI46dHofQ";
    internal const string VapidPrivateKey = "GzIA-6S4MRXOlB2w1RDWAq_4D_CAYdtmWQCiTovlRZI";
    internal const string WahaBaseUrl = "http://waha.test";
    internal const string WahaApiKey = "furria-test-waha-api-key";
    public const string WhatsAppWebhookHmacKey = "furria-test-whatsapp-webhook-hmac-key";
    public const string WhatsAppSession = "furria";
    internal const string ClubAssistantApiKey = "furria-test-assistant-key";
    internal const decimal ClubAssistantInputEurosPerMillion = 1m;
    internal const decimal ClubAssistantCachedInputEurosPerMillion = 0.1m;
    internal const decimal ClubAssistantOutputEurosPerMillion = 4m;

    private static readonly TimeSpan SignedOutWorkTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan ChangeListenerTimeout = TimeSpan.FromSeconds(20);

    public static readonly TimeSpan OutboxDrainTimeout = TimeSpan.FromSeconds(20);

    private readonly ApiTestInfrastructure _infrastructure;

    private readonly List<WebApplicationFactory<Program>> _derivedHosts = [];

    private ApiTestHost? _host;
    private ServiceProvider? _mediaWorker;
    private SeededManagingLogin? _managingLogin;
    private int? _adminRoleId;

    private ApiTestHost Host => _host ?? throw new InvalidOperationException(NotInitialized);

    private ServiceProvider MediaWorker => _mediaWorker ??= BuildMediaWorker();

    public TestClock TimeProvider => Host.TimeProvider;

    public CapturingLogSink Logs => Host.Logs;

    public FakePushService PushService => Host.PushService;

    public FakeWahaService Waha => Host.Waha;

    public FakeModelService Model => Host.Model;

    public IServiceProvider Services => Host.Services;

    public DateOnly Today => ClubClock.Today(TimeProvider);

    public int CurrentSessionYear => ClubSession.YearOf(Today);

    public SeededManagingLogin ManagingLogin =>
        _managingLogin ?? throw new InvalidOperationException(NotInitialized);

    public int AdminRoleId => _adminRoleId ?? throw new InvalidOperationException(NotInitialized);

    public MailpitInbox Mailbox => _infrastructure.Mailbox;

    public string MediaRoot => Host.MediaRoot;

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

    public async ValueTask InitializeAsync()
    {
        _host = await _infrastructure.LeaseHostAsync();
        await ResetDatabaseAsync();
        TimeProvider.SetUtcNow(WholeSecondNow());
        PushService.Forget();
        Waha.Forget();
        Model.Forget();
        EmptyMediaRoot();

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
    }

    private void EmptyMediaRoot()
    {
        if (!Directory.Exists(MediaRoot))
            return;

        foreach (var file in Directory.EnumerateFiles(MediaRoot, "*", SearchOption.AllDirectories))
            File.Delete(file);
    }

    public HttpClient CreateClient() => Host.CreateClient();

    private WebApplicationFactory<Program> Derived(Action<IWebHostBuilder> configuration)
    {
        var derived = Host.WithWebHostBuilder(configuration);
        _derivedHosts.Add(derived);
        return derived;
    }

    public WebApplicationFactory<Program> HostWithSettings(
        IReadOnlyDictionary<string, string> settings
    ) =>
        Derived(builder =>
        {
            foreach (var (key, value) in settings)
                builder.UseSetting(key, value);
        });

    public WebApplicationFactory<Program> HostOnDatabase(string connectionString) =>
        Derived(builder =>
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
    ) => HostOn(await _infrastructure.CreateDatabaseFromTemplateAsync(ct), settings);

    public async Task<WebApplicationFactory<Program>> HostOnEmptyDatabaseAsync(
        IReadOnlyDictionary<string, string> settings,
        CancellationToken ct = default
    ) => HostOn(await CreateEmptyDatabaseAsync(ct), settings);

    private WebApplicationFactory<Program> HostOn(
        string database,
        IReadOnlyDictionary<string, string> settings
    ) =>
        Derived(builder =>
        {
            builder.UseSetting($"ConnectionStrings:{AppDbContext.ConnectionName}", database);
            foreach (var (key, value) in settings)
                builder.UseSetting(key, value);
        });

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

    public Task<IReadOnlyList<OutboxMail>> OutboxAsync(CancellationToken ct = default) =>
        OutboxOfAsync(Host, ct);

    public Task StageOutboxMailAsync(OutboxMail mail, CancellationToken ct = default) =>
        StageOutboxMailAsync(Host, mail, ct);

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

    public Task PushesDrainedAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                return
                    await db.OutboxCalendarPushes.AnyAsync(token)
                    || await db.OutboxPushes.AnyAsync(token)
                    ? null
                    : db;
            },
            OutboxDrainTimeout,
            "The push outboxes still hold pushes",
            ct
        );

    public Task WhatsAppInboxDrainedAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                return await db.InboxWhatsAppEvents.AnyAsync(
                    inboxEvent => inboxEvent.ProcessedAt == null,
                    token
                )
                    ? null
                    : db;
            },
            OutboxDrainTimeout,
            "The WhatsApp inbox still holds unapplied events",
            ct
        );

    public Task WhatsAppOutboxDrainedAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var now = TimeProvider.GetUtcNow();
                return await db.OutboxWhatsApps.AnyAsync(
                    operation =>
                        operation.FailedAt == null
                        && (operation.NextAttemptAt == null || operation.NextAttemptAt <= now),
                    token
                )
                    ? null
                    : db;
            },
            OutboxDrainTimeout,
            "The WhatsApp outbox still holds due operations",
            ct
        );

    public async Task<IReadOnlyList<OutboxWhatsApp>> WhatsAppOutboxAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.OutboxWhatsApps.AsNoTracking().OrderBy(row => row.Id).ToListAsync(ct);
    }

    public async Task<IReadOnlyDictionary<string, int?>> PollIdsByQuestionAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db
            .Polls.AsNoTracking()
            .ToDictionaryAsync(poll => poll.Question, poll => (int?)poll.Id, ct);
    }

    public async Task<IReadOnlyList<int>> PollOptionIdsAsync(
        int pollId,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db
            .PollOptions.AsNoTracking()
            .Where(option => option.PollId == pollId)
            .OrderBy(option => option.Position)
            .Select(option => option.Id)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyDictionary<string, int?>> SignUpListIdsByTitleAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db
            .SignUpLists.AsNoTracking()
            .ToDictionaryAsync(list => list.Title, list => (int?)list.Id, ct);
    }

    public async Task<IReadOnlyList<WhatsAppMessage>> WhatsAppPostRecordsAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.WhatsAppMessages.AsNoTracking().OrderBy(row => row.Id).ToListAsync(ct);
    }

    public async Task AgeWhatsAppPostsAsync(TimeSpan age, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.WhatsAppMessages.ExecuteUpdateAsync(
            setters => setters.SetProperty(row => row.SentAt, row => row.SentAt - age),
            ct
        );
    }

    public async Task BookClubAssistantCallAsync(
        ClubAssistantTokens tokens,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ClubAssistantBudget>().BookAsync(tokens, ct);
    }

    public async Task<IReadOnlyList<ClubAssistantQuestion>> ClubAssistantQuestionsAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db
            .ClubAssistantQuestions.AsNoTracking()
            .OrderBy(question => question.Id)
            .ToListAsync(ct);
    }

    public Task ClubAssistantAnsweredAsync(CancellationToken ct = default) =>
        ClubAssistantAnsweredAsync(OutboxDrainTimeout, ct);

    public Task ClubAssistantAnsweredAsync(TimeSpan timeout, CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var settledBefore =
                    TimeProvider.GetUtcNow() - ClubAssistantConversation.MergeWindow;
                return await db.ClubAssistantQuestions.AnyAsync(
                    question =>
                        question.AnsweredAt == null && question.LastMessageAt <= settledBefore,
                    token
                )
                    ? null
                    : db;
            },
            timeout,
            "The club assistant still owes answers",
            ct
        );

    public async Task PurgeClubAssistantConversationsAsync(CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<ClubAssistantReception>().PurgeAsync(ct);
    }

    public async Task<bool> ClubAssistantHasBudgetLeftAsync(CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        return await scope
            .ServiceProvider.GetRequiredService<ClubAssistantBudget>()
            .HasBudgetLeftAsync(ct);
    }

    public async Task StageWhatsAppGroupAddsAsync(CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<WhatsAppGroupKeeping>().StageAddsAsync(ct);
    }

    public async Task FailWhatsAppOutboxForGoodAsync(CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = TimeProvider.GetUtcNow();
        await db.OutboxWhatsApps.ExecuteUpdateAsync(
            setters => setters.SetProperty(row => row.FailedAt, now),
            ct
        );
    }

    public async Task LinkClubWhatsAppGroupAsync(string chatId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.LinkedWhatsAppGroups.Add(
            new LinkedWhatsAppGroup { ChatId = chatId, LinkedAt = TimeProvider.GetUtcNow() }
        );
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<(string ChatId, int? GroupId)>> LinkedWhatsAppGroupsAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var links = await db
            .LinkedWhatsAppGroups.AsNoTracking()
            .OrderBy(link => link.Id)
            .Select(link => new { link.ChatId, link.GroupId })
            .ToListAsync(ct);
        return [.. links.Select(link => (link.ChatId, link.GroupId))];
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

    public IReadOnlyList<string> ReferencesToPersonDisagreements()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return ReferencesToPerson.DisagreementsWith(db.Model);
    }

    public Task MediaFilesReapedAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
            {
                await using var scope = Services.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                return await db.MediaFileTombstones.AnyAsync(token) ? null : db;
            },
            OutboxDrainTimeout,
            "Files of deleted media items are still on disk",
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
        Waha.Forget();
        Model.Forget();

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
            new TestNews(seeded.News),
            new TestBeerList(seeded.BeerList),
            new TestGroupMatcher(seeded.GroupMatcher),
            new TestIntakes(seeded.Intakes),
            new Expected(scopeFactory)
        );
    }

    public async Task RunManagingLoginSeederAsync(CancellationToken ct = default)
    {
        var seeder = Services.GetServices<IHostedService>().OfType<ManagingLoginSeeder>().Single();
        await seeder.StartAsync(ct);
    }

    public async Task MigrateDatabaseToAsync(string migration, CancellationToken ct = default)
    {
        Host.Taint();
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.GetService<IMigrator>().MigrateAsync(migration, cancellationToken: ct);
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

    public async Task CancelEventDirectlyAsync(int eventId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"UPDATE event SET cancelled_at = now() WHERE calendar_entry_id = {eventId}",
            ct
        );
    }

    public async Task RehostAddOnsDirectlyAsync(
        AddOnTable table,
        int calendarEntryId,
        AddOnHostColumns host,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            RehostingOf(table, calendarEntryId, host.CalendarEntryId, host.AnnouncementId),
            ct
        );
    }

    public async Task DeleteAnnouncementDirectlyAsync(
        int announcementId,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"DELETE FROM announcement WHERE id = {announcementId}",
            ct
        );
    }

    public async Task<int> PendingNewsPictureOfAsync(int newsPostId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await db
            .NewsPosts.Where(post => post.Id == newsPostId)
            .Select(post => post.PendingPictureId!.Value)
            .SingleAsync(ct);
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
        return Path.Combine(MediaRoot, MediaPaths.RenditionOf(storageKey, rendition));
    }

    public async Task<string> SoundProfileOfAsync(int mediaItemId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var storageKey = await db
            .MediaItems.Where(item => item.Id == mediaItemId)
            .Select(item => item.StorageKey)
            .SingleAsync(ct);
        return Path.Combine(MediaRoot, MediaPaths.SoundProfileOf(storageKey));
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
            | await runner.RunNextAsync(MediaKind.Audio, ct)
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

    public async Task RenderSongDirectlyAsync(
        int mediaItemId,
        double durationSeconds,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var item = await db.MediaItems.SingleAsync(row => row.Id == mediaItemId, ct);
        item.State = MediaItemState.Ready;
        item.DurationSeconds = durationSeconds;
        item.RenderedAt = TimeProvider.GetUtcNow();
        db.MediaJobs.RemoveRange(db.MediaJobs.Where(job => job.MediaItemId == mediaItemId));
        await db.SaveChangesAsync(ct);
    }

    public async Task<long> WriteLogEntryDirectlyAsync(
        LogSource source,
        LogEntryLevel level,
        DateTimeOffset loggedAt,
        string message,
        string category = "Furria.Tests",
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var entry = new LogEntry
        {
            LoggedAt = loggedAt,
            Source = source,
            Instance = "furria-tests",
            Level = level,
            Category = category,
            Template = message,
            Message = message,
        };
        db.LogEntries.Add(entry);
        await db.SaveChangesAsync(ct);
        return entry.Id;
    }

    public Task PurgeLogEntriesAsync(CancellationToken ct = default) =>
        PurgeLogEntriesOnAsync(Host, ct);

    public static Task PurgeLogEntriesOnAsync(
        WebApplicationFactory<Program> host,
        CancellationToken ct = default
    ) =>
        host.Services.GetServices<IHostedService>().OfType<LogEntryPurge>().Single().PurgeAsync(ct);

    public Task BeatAsMediaWorkerAsync(CancellationToken ct = default) =>
        MediaWorker.GetRequiredService<MediaWorkerBeat>().BeatAsync(ct);

    public void SweepAbandonedUploads() =>
        Services.GetServices<IHostedService>().OfType<AbandonedUploadSweep>().Single().Sweep();

    public Task FreezeActCastsAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<ActCastFreeze>().Single().FreezeAsync(ct);

    public Task RemindOfBeerTabsAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<BeerTabReminders>().Single().RemindAsync(ct);

    public Task WarnOfBeerStockAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<BeerStockWarnings>().Single().WarnAsync(ct);

    public Task PurgeGalleryBinAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<GalleryBinPurge>().Single().PurgeAsync(ct);

    public Task SweepIntakesAsync(CancellationToken ct = default) =>
        Services.GetServices<IHostedService>().OfType<IntakeExpirySweep>().Single().SweepAsync(ct);

    public string SignedMediaUrl(int mediaItemId, MediaOwner owner, MediaRendition rendition) =>
        Services.GetRequiredService<MediaUrlSigner>().UrlOf(mediaItemId, owner, rendition);

    public async Task ChangeEveningCastDirectlyAsync(
        int eventId,
        int actId,
        int personId,
        CastChange change,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var appearanceId = await db
            .Appearances.Where(appearance =>
                appearance.CalendarEntryId == eventId && appearance.ActId == actId
            )
            .Select(appearance => appearance.Id)
            .SingleAsync(ct);
        db.AppearanceCastChanges.Add(
            new AppearanceCastChange
            {
                AppearanceId = appearanceId,
                PersonId = personId,
                Change = change,
            }
        );
        await db.SaveChangesAsync(ct);
    }

    public async Task SeatAndEntrustDirectlyAsync(
        int actId,
        int spotId,
        int personId,
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"UPDATE spot SET person_id = {personId} WHERE id = {spotId}",
            ct
        );
        await db.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO act_co_editor (act_id, person_id, granted_by_person_id, granted_at)
            VALUES ({actId}, {personId}, NULL, now())
            """,
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

    public async Task DisableAccountDirectlyAsync(int accountId, CancellationToken ct = default)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlAsync(
            $"UPDATE account SET is_disabled = TRUE WHERE id = {accountId}",
            ct
        );
    }

    public IReadOnlyList<string> ChangedTablesDisagreements()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return ChangedTables.DisagreementsWith(db.Model);
    }

    public async Task<IReadOnlyList<string>> ChangeNotificationDisagreementsAsync(
        CancellationToken ct = default
    )
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = ChangeNotifyingTablesQuery;
        command.Parameters.Add(new NpgsqlParameter("trigger", ChangeNotifications.TriggerName));
        command.Parameters.Add(new NpgsqlParameter("type", AfterEveryWriteStatement));
        await using var reader = await command.ExecuteReaderAsync(ct);

        var triggered = new Dictionary<string, bool>(StringComparer.Ordinal);
        while (await reader.ReadAsync(ct))
            triggered[reader.GetString(0)] = reader.GetBoolean(1);

        return
        [
            .. ChangedTables
                .ByTable(db.Model)
                .Keys.Where(table => !triggered.GetValueOrDefault(table))
                .Order(StringComparer.Ordinal)
                .Select(table =>
                    $"{table} names changes but notifies none after every write statement"
                ),
            .. ChangedTables
                .UnrelatedTables(db.Model)
                .Where(triggered.ContainsKey)
                .Order(StringComparer.Ordinal)
                .Select(table => $"{table} is declared unrelated but notifies changes"),
        ];
    }

    public Task ChangeListenerListeningAsync(CancellationToken ct = default) =>
        Polling.UntilAsync(
            async token =>
                await ChangeListenersAsync(ListeningChangeListenersQuery, token) > 0
                    ? (object?)true
                    : null,
            ChangeListenerTimeout,
            "The change listener is not listening",
            ct
        );

    public async Task CutChangeListenerAsync(CancellationToken ct = default)
    {
        await ChangeListenerListeningAsync(ct);
        await ChangeListenersAsync(CutChangeListenersQuery, ct);
    }

    private async Task<int> ChangeListenersAsync(string query, CancellationToken ct)
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = query;
        command.Parameters.Add(new NpgsqlParameter("listener", ChangeListener.ApplicationName));
        return (int)(await command.ExecuteScalarAsync(ct))!;
    }

    public Task<IReadOnlyList<string>> GetAppliedMigrationsAsync(CancellationToken ct = default) =>
        AppliedMigrationsOfAsync(Host, ct);

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
        await Host.ResetService.ResetAsync(ct);
    }

    public async ValueTask DisposeAsync()
    {
        if (_mediaWorker is not null)
            await _mediaWorker.DisposeAsync();
        foreach (var derived in _derivedHosts)
            await derived.DisposeAsync();
        if (_host is null)
            return;

        if (_host.Tainted)
            await _host.DisposeAsync();
        else
            _infrastructure.ReturnHost(_host);
    }

    private static FormattableString RehostingOf(
        AddOnTable table,
        int calendarEntryId,
        int? newCalendarEntryId,
        int? announcementId
    ) =>
        table switch
        {
            AddOnTable.Poll =>
                $"UPDATE poll SET calendar_entry_id = {newCalendarEntryId}, announcement_id = {announcementId} WHERE calendar_entry_id = {calendarEntryId}",
            AddOnTable.SignUpList =>
                $"UPDATE sign_up_list SET calendar_entry_id = {newCalendarEntryId}, announcement_id = {announcementId} WHERE calendar_entry_id = {calendarEntryId}",
            _ =>
                $"UPDATE attendance_response SET calendar_entry_id = {newCalendarEntryId}, announcement_id = {announcementId} WHERE calendar_entry_id = {calendarEntryId}",
        };
}
