namespace Furria.Infrastructure.Logging;

public sealed class ConsoleLogOptions
{
    public const string SectionName = "ConsoleLog";

    public ConsoleLogFormat Format { get; init; } = ConsoleLogFormat.Json;
}
