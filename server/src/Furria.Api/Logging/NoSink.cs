using Serilog.Core;
using Serilog.Events;

namespace Furria.Api.Logging;

internal sealed class NoSink : ILogEventSink
{
    public void Emit(LogEvent logEvent) { }
}
