using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Media;
using Furria.MediaWorker.Jobs;
using Serilog;

#pragma warning disable MET008

namespace Furria.MediaWorker;

public static class MediaWorkerProgram
{
    public static async Task<int> Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder();
        Log.Logger = FurriaLogging.CreateBootstrapLogger(builder.Configuration);

        try
        {
            builder.Services.AddFurriaLogging(builder.Configuration);
            builder.Services.AddMediaWorker(builder.Configuration);
            if (RegenerationRequest.IsRequested(args))
                await RegenerateAsync(builder, args);
            else
                await RunAsync(builder);
            return 0;
        }
        catch (Exception exception) when (exception is not HostAbortedException)
        {
            Log.Fatal(exception, "Media worker terminated unexpectedly");
            return 1;
        }
        finally
        {
            await Log.CloseAndFlushAsync();
        }
    }

    private static async Task RunAsync(HostApplicationBuilder builder)
    {
        builder.Services.AddMediaWorkerLanes();
        using var host = builder.Build();
        await host.RunAsync();
    }

    private static async Task RegenerateAsync(HostApplicationBuilder builder, string[] args)
    {
        var command =
            RegenerationRequest.CommandOf(args)
            ?? throw new ArgumentException($"Usage: {RegenerationRequest.Usage}");
        using var host = builder.Build();
        await using var scope = host.Services.CreateAsyncScope();
        var queued = await scope
            .ServiceProvider.GetRequiredService<MediaJobQueue>()
            .RegenerateAsync(command, CancellationToken.None);
        Log.Information("Renditions of {MediaItemCount} media items queued", queued);
    }
}
