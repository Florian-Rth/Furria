using System.Diagnostics.Contracts;
using Serilog.Events;

namespace Furria.Infrastructure.Logging;

public static class DatabaseLogFilter
{
    private const string SourceContextProperty = "SourceContext";
    private const string RequestLoggingCategory = "Serilog.AspNetCore.RequestLoggingMiddleware";

    private static readonly string[] AlwaysMutedCategories =
    [
        "Microsoft.EntityFrameworkCore",
        "Npgsql",
    ];

    private static readonly string[] WarningOnlyCategories =
    [
        "Microsoft.AspNetCore",
        "System.Net.Http",
    ];

    private static readonly string[] RequestEventProperties =
    [
        "RequestMethod",
        "StatusCode",
        "Elapsed",
    ];

    [Pure]
    public static bool Keeps(LogEvent logEvent)
    {
        if (logEvent.Level < LogEventLevel.Information)
            return false;

        var category = CategoryOf(logEvent);
        if (AlwaysMutedCategories.Any(muted => IsWithin(category, muted)))
            return false;
        if (WarningOnlyCategories.Any(chatty => IsWithin(category, chatty)))
            return logEvent.Level >= LogEventLevel.Warning;
        if (IsRequestEvent(logEvent, category))
            return logEvent.Level >= LogEventLevel.Error;
        return true;
    }

    [Pure]
    public static string CategoryOf(LogEvent logEvent) =>
        logEvent.Properties.TryGetValue(SourceContextProperty, out var value)
        && value is ScalarValue { Value: string category }
            ? category
            : "";

    [Pure]
    private static bool IsWithin(string category, string root) =>
        category.StartsWith(root, StringComparison.Ordinal)
        && (category.Length == root.Length || category[root.Length] == '.');

    [Pure]
    private static bool IsRequestEvent(LogEvent logEvent, string category) =>
        category == RequestLoggingCategory
        || RequestEventProperties.All(logEvent.Properties.ContainsKey);
}
