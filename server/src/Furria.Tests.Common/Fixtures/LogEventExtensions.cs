using Serilog.Events;

namespace Furria.Tests.Common.Fixtures;

public static class LogEventExtensions
{
    public static object? ScalarOf(this LogEvent logEvent, string propertyName) =>
        logEvent.Properties.TryGetValue(propertyName, out var value) && value is ScalarValue scalar
            ? scalar.Value
            : null;
}
