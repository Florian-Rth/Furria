using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Management;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.MembershipApplications;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Furria.Infrastructure.Roles;
using Furria.Infrastructure.Start;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure;

public static class ServiceCollectionExtensions
{
    public const string DataProtectionApplicationName = "Furria";

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddFurriaPersistence(configuration);

        services
            .AddIdentityCore<Account>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = PasswordRule.MinimumLength;
                options.Password.RequiredUniqueChars = 1;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();
        services
            .AddOptions<IdentityPasskeyOptions>()
            .Configure<IOptions<PasskeyOptions>, IOptions<ClubAppOptions>>(
                (passkeys, relyingParty, clubApp) =>
                    PasskeyRelyingParty.Configure(passkeys, relyingParty.Value, clubApp.Value)
            );

        services
            .AddDataProtection()
            .SetApplicationName(DataProtectionApplicationName)
            .PersistKeysToDbContext<AppDbContext>();
        services.AddAuthentication();

        services.AddScoped<AccessTokenService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<AccountService>();
        services.AddScoped<AccountAccessService>();
        services.AddScoped<EmailConfirmationService>();
        services.AddScoped<CredentialChangeNotifier>();
        services.AddScoped<PasskeyService>();
        services.AddScoped<PermissionAuthorizer>();
        services.AddScoped<AffiliationLookup>();
        services.AddScoped<PersonService>();
        services.AddScoped<MembershipService>();
        services.AddScoped<FeeReductionService>();
        services.AddScoped<GroupService>();
        services.AddScoped<GroupKindService>();
        services.AddScoped<TrainingService>();
        services.AddScoped<RoleService>();
        services.AddScoped<RunningBoardSeats>();
        services.AddScoped<ClubService>();
        services.AddScoped<SessionRecordService>();
        services.AddScoped<VenueService>();
        services.AddScoped<BoardService>();
        services.AddScoped<KeyHoldingService>();
        services.AddScoped<AnnouncementService>();
        services.AddScoped<CalendarService>();
        services.AddScoped<EventService>();
        services.AddScoped<TicketRequestService>();
        services.AddScoped<TicketRequestArrivalNotifier>();
        services.AddScoped<ClubRecordService>();
        services.AddScoped<ManagementService>();
        services.AddScoped<ToDoService>();
        services.AddScoped<StartService>();
        services.AddScoped<InvitationRoundService>();
        services.AddScoped<ReauthenticationService>();
        services.AddScoped<AccountSecurityService>();
        services.AddScoped<AccessRecoveryService>();
        services.AddScoped<AccountAdministrationService>();
        services.AddScoped<AccountClaimService>();
        services.AddScoped<PersonAdoptionService>();
        services.AddScoped<PersonArchiveService>();
        services.AddScoped<PersonErasureService>();
        services.AddScoped<MembershipApplicationService>();
        services.AddScoped<MembershipApplicationArrivalNotifier>();
        services.AddScoped<DatabaseHealthService>();
        services.AddSingleton<MediaRoot>();
        services.AddSingleton<MediaUrlSigner>();
        services.AddScoped<MediaStore>();
        services.AddScoped<MediaOwnerAccess>();
        services.AddSingleton<MediaFiles>();
        services.AddSingleton<MediaPictures>();
        services.AddScoped<PictureService>();
        services.AddScoped<PictureLookup>();
        services.AddScoped<PublicMediaService>();
        services.AddScoped<MediaJobQueue>();
        services.AddHostedService<AbandonedUploadSweep>();
        services.AddScoped<GalleryService>();

        services.AddScoped<MailOutbox>();
        services.AddSingleton<MailService>();
        services.AddHostedService<DatabaseMigrator>();
        services.AddHostedService<ManagingLoginSeeder>();
        services.AddHostedService<GalleryBinPurge>();
        services.AddHostedService<MailDispatcher>();
        services.AddScoped<AccessRequestService>();
        services.AddScoped<PasswordResetService>();
        services.AddSingleton<SignedOutMailRequestQueue>();
        services.AddSingleton<PasswordResetMailThrottle>();
        services.AddHostedService<SignedOutMailRequestWorker>();
        services.AddHostedService<UnconfirmedApplicationPurge>();
        services.AddHostedService<PastTicketRequestPurge>();
        services.Configure<DataProtectionTokenProviderOptions>(options =>
            options.TokenLifespan = PasswordResetService.LinkLifetime
        );
        return services;
    }

    public static IServiceCollection AddFurriaPersistence(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.Configure<IdentityOptions>(options =>
            options.Stores.SchemaVersion = IdentitySchemaVersions.Version3
        );
        services.AddSingleton<AuditTimestampInterceptor>();
        services.AddSingleton<MailOutboxSignal>();
        services.AddSingleton<MailOutboxWakeUp>();
        services.AddDbContext<AppDbContext>(
            (serviceProvider, options) =>
                options
                    .UseNpgsql(
                        configuration.GetConnectionString(AppDbContext.ConnectionName),
                        npgsql =>
                            npgsql
                                .MigrationsHistoryTable("__ef_migrations_history")
                                .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
                    )
                    .UseSnakeCaseNamingConvention()
                    .AddInterceptors(
                        serviceProvider.GetRequiredService<AuditTimestampInterceptor>(),
                        serviceProvider.GetRequiredService<MailOutboxWakeUp>()
                    )
        );
        services.TryAddSingleton(TimeProvider.System);
        return services;
    }
}
