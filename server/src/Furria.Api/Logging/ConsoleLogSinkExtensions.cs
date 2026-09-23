using Serilog;
using Serilog.Configuration;
using Serilog.Formatting.Compact;

namespace Furria.Api.Logging;

public static class ConsoleLogSinkExtensions
{
    private const string ReadableTemplate =
        "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}";

    public static LoggerConfiguration ConsoleIn(
        this LoggerSinkConfiguration writeTo,
        ConsoleLogFormat format
    ) =>
        format switch
        {
            ConsoleLogFormat.Json => writeTo.Console(new RenderedCompactJsonFormatter()),
            ConsoleLogFormat.Readable => writeTo.Console(outputTemplate: ReadableTemplate),
            ConsoleLogFormat.Off => writeTo.Sink(new NoSink()),
            _ => throw new ArgumentOutOfRangeException(nameof(format), format, null),
        };

    public static ConsoleLogFormat ConsoleLogFormatOf(this IConfiguration configuration) =>
        configuration.GetSection(ConsoleLogOptions.SectionName).Get<ConsoleLogOptions>()?.Format
        ?? new ConsoleLogOptions().Format;
}
