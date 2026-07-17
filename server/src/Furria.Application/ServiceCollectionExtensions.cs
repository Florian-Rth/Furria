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

        return services;
    }
}
