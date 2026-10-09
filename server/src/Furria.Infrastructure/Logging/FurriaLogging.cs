using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace Furria.Infrastructure.Logging;

public static class FurriaLogging
{
    public static Serilog.ILogger CreateBootstrapLogger(IConfiguration configuration) =>
        new LoggerConfiguration()
            .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf())
            .CreateLogger();

    public static IServiceCollection AddFurriaLogging(
        this IServiceCollection services,
        IConfiguration configuration
    ) =>
        services.AddSerilog(
            (provider, logger) =>
                logger
                    .ReadFrom.Configuration(configuration)
                    .ReadFrom.Services(provider)
                    .Enrich.FromLogContext()
                    .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf()),
            preserveStaticLogger: true
        );
}
