using Serilog.Core;
using Serilog.Events;

namespace Furria.Infrastructure.Logging;

internal sealed class NoSink : ILogEventSink
{
    public void Emit(LogEvent logEvent) { }
}
