using Serilog.Core;
using Serilog.Events;

namespace Furria.Tests.Common.Fixtures;

public sealed class CapturingLogSink : ILogEventSink
{
    private readonly Lock _gate = new();
    private readonly List<LogEvent> _events = [];

    public void Emit(LogEvent logEvent)
    {
        lock (_gate)
            _events.Add(logEvent);
    }

    public LogMark Mark()
    {
        lock (_gate)
            return new LogMark(_events.Count);
    }

    public IReadOnlyList<LogEvent> All() => Since(new LogMark(0));

    public IReadOnlyList<LogEvent> Since(LogMark mark)
    {
        lock (_gate)
            return [.. _events.Skip(mark.Position)];
    }

    public IReadOnlyList<LogEvent> Written(string messageTemplate) =>
        Written(messageTemplate, new LogMark(0));

    public IReadOnlyList<LogEvent> Written(string messageTemplate, LogMark since) =>
        [.. Since(since).Where(logged => logged.MessageTemplate.Text == messageTemplate)];
}
