using System.Globalization;
using Furria.Api.Altcha;
using Furria.Api.Proxies;
using Furria.Api.RateLimiting;
using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Mail;
using Furria.Application.Media;
using Furria.Application.Push;
using Furria.Application.Website;
using Furria.Core.Halls;
using Furria.Core.Roles;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Furria.Tests.Common.Push;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog.Core;

namespace Furria.Tests.Common.Fixtures;

internal sealed class ApiTestHost : WebApplicationFactory<Program>
{
    private readonly ApiTestInfrastructure _infrastructure;
    private const string NotStarted = "ApiTestHost has not been started yet.";

    private readonly string _database;
    private DatabaseResetService? _resetService;

    public TestClock TimeProvider { get; } = new(DateTimeOffset.UtcNow);

    public CapturingLogSink Logs { get; } = new();

    public FakePushService PushService { get; } = new();

    public string Database => _database;

    public string MediaRoot { get; } =
        Path.Combine(Path.GetTempPath(), "furria-tests-media", Guid.NewGuid().ToString("N"));

    public bool Tainted { get; private set; }

    public LogMark Started { get; private set; }

    public DatabaseResetService ResetService =>
        _resetService ?? throw new InvalidOperationException(NotStarted);

    public ApiTestHost(ApiTestInfrastructure infrastructure, string database)
    {
        _infrastructure = infrastructure;
        _database = database;
    }

    public void Taint() => Tainted = true;

    public async Task StartAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Started = Logs.Mark();
        _resetService = await DatabaseResetService.CreateAsync(
            [db],
            [
                typeof(Account),
                typeof(Role),
                typeof(RolePermission),
                typeof(TableType),
                typeof(SeatingStandard),
            ],
            [typeof(DataProtectionKey)],
            CancellationToken.None
        );
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting(
            $"{ConsoleLogOptions.SectionName}:{nameof(ConsoleLogOptions.Format)}",
            nameof(ConsoleLogFormat.Off)
        );
        builder.UseSetting($"ConnectionStrings:{AppDbContext.ConnectionName}", _database);
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.SigningKey)}",
            ApiTestFixture.SigningKey
        );
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.Issuer)}",
            ApiTestFixture.Issuer
        );
        builder.UseSetting(
            $"{AccessTokenOptions.SectionName}:{nameof(AccessTokenOptions.Audience)}",
            ApiTestFixture.Audience
        );
        builder.UseSetting(
            $"{ManagingLoginOptions.SectionName}:{nameof(ManagingLoginOptions.Email)}",
            ApiTestFixture.ManagingLoginEmail
        );
        builder.UseSetting(
            $"{ManagingLoginOptions.SectionName}:{nameof(ManagingLoginOptions.Password)}",
            ApiTestFixture.ManagingLoginPassword
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
            ApiTestFixture.ClubAppBaseUrl
        );
        builder.UseSetting(
            $"{WebsiteOptions.SectionName}:{nameof(WebsiteOptions.BaseUrl)}",
            ApiTestFixture.WebsiteBaseUrl
        );
        builder.UseSetting(
            $"{PasskeyOptions.SectionName}:{nameof(PasskeyOptions.RelyingPartyId)}",
            ApiTestFixture.ClubDomain
        );
        builder.UseSetting(
            $"{ClubAppOptions.SectionName}:{nameof(ClubAppOptions.AndroidCertFingerprints)}:0",
            ApiTestFixture.AndroidCertFingerprint
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIpOnboarding)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerClaimName)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerToken)}",
            ApiTestFixture.PermitsPerInvitationToken.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.FailedLoginsPerIp)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.RejectedRefreshesPerToken)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.RejectedRefreshesPerIp)}",
            ApiTestFixture.PermitsPerIpBeyondAnySuite.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.HmacKey)}",
            ApiTestFixture.AltchaHmacKey
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.Cost)}",
            ApiTestFixture.AltchaCost.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.MinCounter)}",
            ApiTestFixture.AltchaMinCounter.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{AltchaOptions.SectionName}:{nameof(AltchaOptions.MaxCounter)}",
            ApiTestFixture.AltchaMaxCounter.ToString(CultureInfo.InvariantCulture)
        );
        builder.UseSetting(
            $"{MediaOptions.SectionName}:{nameof(MediaOptions.RootPath)}",
            MediaRoot
        );
        builder.UseSetting(
            $"{MediaOptions.SectionName}:{nameof(MediaOptions.SigningKey)}",
            ApiTestFixture.MediaSigningKey
        );
        builder.UseSetting(
            $"{PushOptions.SectionName}:{nameof(PushOptions.VapidPublicKey)}",
            ApiTestFixture.VapidPublicKey
        );
        builder.UseSetting(
            $"{PushOptions.SectionName}:{nameof(PushOptions.VapidPrivateKey)}",
            ApiTestFixture.VapidPrivateKey
        );
        builder.UseSetting(
            $"{PushOptions.SectionName}:{nameof(PushOptions.Subject)}",
            ApiTestFixture.ClubAppBaseUrl
        );
        builder.UseSetting(
            $"{TrustedProxyOptions.SectionName}:{nameof(TrustedProxyOptions.TrustedProxies)}:0",
            ApiTestFixture.TrustedProxyAddress
        );
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(TimeProvider);
            services.AddSingleton<ILogEventSink>(Logs);
            services.Configure<PasswordHasherOptions>(options =>
                options.IterationCount = ApiTestFixture.PasswordHashIterations
            );
        });
        builder.ConfigureTestServices(services =>
            services
                .AddHttpClient(PushSender.HttpClientName)
                .ConfigurePrimaryHttpMessageHandler(() => PushService)
                .SetHandlerLifetime(Timeout.InfiniteTimeSpan)
        );
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _infrastructure.DropDatabaseAsync(_database);
        if (Directory.Exists(MediaRoot))
            Directory.Delete(MediaRoot, recursive: true);
    }
}
