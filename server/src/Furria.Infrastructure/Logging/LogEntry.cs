using Furria.Application.Operations;

namespace Furria.Infrastructure.Logging;

public sealed class LogEntry
{
    public const int SourceLength = 16;
    public const int InstanceLength = 100;
    public const int LevelLength = 16;
    public const int CategoryLength = 200;
    public const int TemplateLength = 2000;
    public const int MessageLength = 2000;
    public const int ExceptionLength = 8000;
    public const int TraceIdLength = 32;

    public long Id { get; set; }

    public DateTimeOffset LoggedAt { get; set; }

    public LogSource Source { get; set; }

    public string Instance { get; set; } = "";

    public LogEntryLevel Level { get; set; }

    public string Category { get; set; } = "";

    public string Template { get; set; } = "";

    public string Message { get; set; } = "";

    public string? Exception { get; set; }

    public string? TraceId { get; set; }
}
