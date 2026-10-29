using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Infrastructure;
using Furria.Infrastructure.Media;
using Furria.MediaWorker.Heartbeat;
using Furria.MediaWorker.Jobs;
using Furria.MediaWorker.Photos;
using Furria.MediaWorker.Sound;
using Furria.MediaWorker.Videos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Furria.MediaWorker;

public static class MediaWorkerServiceCollectionExtensions
{
    public static IServiceCollection AddMediaWorker(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddFurriaPersistence(configuration);
        services
            .AddOptions<MediaOptions>()
            .BindConfiguration(MediaOptions.SectionName)
            .Validate(
                options => options.RootPath.Length > 0,
                $"{MediaOptions.SectionName} needs a RootPath."
            )
            .ValidateOnStart();
        services
            .AddOptions<MediaWorkerOptions>()
            .BindConfiguration(MediaWorkerOptions.SectionName)
            .Validate(
                options => Enum.IsDefined(options.HardwareAcceleration),
                $"{MediaWorkerOptions.SectionName} needs a HardwareAcceleration of none, vaapi or qsv."
            )
            .ValidateOnStart();

        services.AddSingleton<MediaRoot>();
        services.AddScoped<MediaJobQueue>();
        services.AddSingleton<PhotoRenderer>();
        services.AddSingleton<VideoRenderer>();
        services.AddSingleton<AudioRenderer>();
        services.AddSingleton<SoundAnalyser>();
        services.AddSingleton<MediaJobRunner>();
        services.AddSingleton<MediaWorkerActivity>();
        services.AddScoped<MediaWorkerHeartbeats>();
        services.AddSingleton<MediaWorkerBeat>();
        return services;
    }

    public static IServiceCollection AddMediaWorkerLanes(this IServiceCollection services)
    {
        services.AddHostedService(provider => provider.GetRequiredService<MediaWorkerBeat>());
        services.AddSingleton<IHostedService>(provider =>
            ActivatorUtilities.CreateInstance<MediaWorkerLane>(provider, MediaKind.Photo)
        );
        services.AddSingleton<IHostedService>(provider =>
            ActivatorUtilities.CreateInstance<MediaWorkerLane>(provider, MediaKind.Video)
        );
        services.AddSingleton<IHostedService>(provider =>
            ActivatorUtilities.CreateInstance<MediaWorkerLane>(provider, MediaKind.Audio)
        );
        return services;
    }
}
