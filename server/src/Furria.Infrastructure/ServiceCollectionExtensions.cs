using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddSingleton<AuditTimestampInterceptor>();
        services.AddDbContext<AppDbContext>(
            (serviceProvider, options) =>
                options
                    .UseNpgsql(
                        configuration.GetConnectionString(AppDbContext.ConnectionName),
                        npgsql => npgsql.MigrationsHistoryTable("__ef_migrations_history")
                    )
                    .UseSnakeCaseNamingConvention()
                    .AddInterceptors(
                        serviceProvider.GetRequiredService<AuditTimestampInterceptor>()
                    )
        );

        services
            .AddIdentityCore<Account>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 12;
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();

        services.AddAuthentication();

        services.AddScoped<AccessTokenService>();
        services.AddScoped<RefreshTokenService>();
        services.AddScoped<AccountService>();
        services.AddScoped<PermissionAuthorizer>();
        services.AddScoped<PersonService>();
        services.AddScoped<MembershipService>();
        services.AddScoped<FeeReductionService>();
        services.AddScoped<GroupService>();

        services.AddHostedService<DatabaseMigrator>();
        services.AddHostedService<BootstrapAdminSeeder>();
        services.AddSingleton(TimeProvider.System);
        return services;
    }
}
