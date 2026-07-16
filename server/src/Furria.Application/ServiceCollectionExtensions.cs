using Furria.Application.PreviewAccess;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddOptions<PreviewAccessOptions>().BindConfiguration("PreviewAccess");
        services.AddSingleton<IPreviewAccessService, PreviewAccessService>();

        return services;
    }
}
