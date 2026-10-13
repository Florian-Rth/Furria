using Furria.Application.Operations;
using Furria.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Configuration;
using Serilog.Events;

namespace Furria.Infrastructure.Logging;

public static class FurriaLogging
{
    private static readonly BatchingOptions DatabaseBatching = new()
    {
        BatchSizeLimit = 500,
        BufferingTimeLimit = TimeSpan.FromSeconds(2),
        QueueLimit = 10_000,
    };

    public static Serilog.ILogger CreateBootstrapLogger(IConfiguration configuration) =>
        new LoggerConfiguration()
            .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf())
            .CreateLogger();

    public static IServiceCollection AddFurriaLogging(
        this IServiceCollection services,
        IConfiguration configuration,
        LogSource source
    ) =>
        services.AddSerilog(
            (provider, logger) =>
                logger
                    .ReadFrom.Configuration(configuration)
                    .ReadFrom.Services(provider)
                    .Enrich.FromLogContext()
                    .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf())
                    .WriteTo.DatabaseIn(configuration, source),
            preserveStaticLogger: true
        );

    private static LoggerConfiguration DatabaseIn(
        this LoggerSinkConfiguration writeTo,
        IConfiguration configuration,
        LogSource source
    )
    {
        var connectionString = configuration.GetConnectionString(AppDbContext.ConnectionName);
        if (!SystemLogOptions.Of(configuration).Enabled || string.IsNullOrEmpty(connectionString))
            return writeTo.Logger(_ => { });

        return writeTo.Logger(database =>
            database
                .Filter.ByIncludingOnly(DatabaseLogFilter.Keeps)
                .WriteTo.Sink(
                    new DatabaseLogSink(connectionString, source, Environment.MachineName),
                    DatabaseBatching,
                    LogEventLevel.Information
                )
        );
    }
}
