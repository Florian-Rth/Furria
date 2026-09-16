using Furria.Application.Identity;
using Furria.Application.PreviewAccess;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services
            .AddOptions<PreviewAccessOptions>()
            .BindConfiguration(PreviewAccessOptions.SectionName);
        services.AddSingleton<PreviewAccessService>();

        services
            .AddOptions<AccessTokenOptions>()
            .BindConfiguration(AccessTokenOptions.SectionName)
            .Validate(
                options =>
                    options.SigningKey.Length >= 32
                    && options.Issuer.Length > 0
                    && options.Audience.Length > 0,
                $"{AccessTokenOptions.SectionName} needs an Issuer, an Audience and a SigningKey "
                    + "of at least 32 characters."
            )
            .ValidateOnStart();

        services
            .AddOptions<RefreshTokenOptions>()
            .BindConfiguration(RefreshTokenOptions.SectionName)
            .Validate(
                options => options.Lifetime > options.ReuseGraceWindow,
                $"{RefreshTokenOptions.SectionName}:Lifetime must exceed ReuseGraceWindow."
            )
            .ValidateOnStart();

        services
            .AddOptions<BootstrapAdminOptions>()
            .BindConfiguration(BootstrapAdminOptions.SectionName);

        return services;
    }
}
