using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Operations;
using Npgsql;
using NpgsqlTypes;
using Serilog.Core;
using Serilog.Debugging;
using Serilog.Events;

namespace Furria.Infrastructure.Logging;

public sealed class DatabaseLogSink : IBatchedLogEventSink, IDisposable, IAsyncDisposable
{
    private const string ApplicationName = "furria-log-sink";
    private const int MaxPoolSize = 2;
    private const string CopyCommand = """
        COPY log_entry (logged_at, source, instance, level, category, template, message, exception, trace_id)
        FROM STDIN (FORMAT BINARY)
        """;

    private static readonly TimeSpan WriteTimeout = TimeSpan.FromSeconds(10);

    private readonly NpgsqlDataSource _dataSource;
    private readonly string _source;
    private readonly string _instance;

    public DatabaseLogSink(string connectionString, LogSource source, string instance)
    {
        var builder = new NpgsqlDataSourceBuilder(connectionString);
        builder.ConnectionStringBuilder.ApplicationName = ApplicationName;
        builder.ConnectionStringBuilder.MaxPoolSize = MaxPoolSize;
        _dataSource = builder.Build();
        _source = source.ToString();
        _instance = Truncated(instance, LogEntry.InstanceLength);
    }

    public async Task EmitBatchAsync(IReadOnlyCollection<LogEvent> batch)
    {
        try
        {
            using var timeout = new CancellationTokenSource(WriteTimeout);
            await WriteAsync(batch, timeout.Token);
        }
        catch (Exception exception)
        {
            SelfLog.WriteLine(
                "Database log sink dropped {0} events: {1}",
                batch.Count,
                exception.Message
            );
        }
    }

    public Task OnEmptyBatchAsync() => Task.CompletedTask;

    public void Dispose() => _dataSource.Dispose();

    public ValueTask DisposeAsync() => _dataSource.DisposeAsync();

    private async Task WriteAsync(IReadOnlyCollection<LogEvent> batch, CancellationToken ct)
    {
        await using var connection = await _dataSource.OpenConnectionAsync(ct);
        await using var importer = await connection.BeginBinaryImportAsync(CopyCommand, ct);
        importer.Timeout = WriteTimeout;
        foreach (var logEvent in batch)
            await WriteRowAsync(importer, logEvent, ct);
        await importer.CompleteAsync(ct);
    }

    private async Task WriteRowAsync(
        NpgsqlBinaryImporter importer,
        LogEvent logEvent,
        CancellationToken ct
    )
    {
        await importer.StartRowAsync(ct);
        await importer.WriteAsync(
            logEvent.Timestamp.ToUniversalTime(),
            NpgsqlDbType.TimestampTz,
            ct
        );
        await importer.WriteAsync(_source, NpgsqlDbType.Varchar, ct);
        await importer.WriteAsync(_instance, NpgsqlDbType.Varchar, ct);
        await importer.WriteAsync(LevelOf(logEvent.Level).ToString(), NpgsqlDbType.Varchar, ct);
        await importer.WriteAsync(
            Truncated(DatabaseLogFilter.CategoryOf(logEvent), LogEntry.CategoryLength),
            NpgsqlDbType.Varchar,
            ct
        );
        await importer.WriteAsync(
            Truncated(logEvent.MessageTemplate.Text, LogEntry.TemplateLength),
            NpgsqlDbType.Varchar,
            ct
        );
        await importer.WriteAsync(
            Truncated(logEvent.RenderMessage(CultureInfo.InvariantCulture), LogEntry.MessageLength),
            NpgsqlDbType.Varchar,
            ct
        );
        await WriteNullableAsync(
            importer,
            logEvent.Exception is { } exception
                ? Truncated(exception.ToString(), LogEntry.ExceptionLength)
                : null,
            ct
        );
        await WriteNullableAsync(importer, logEvent.TraceId?.ToHexString(), ct);
    }

    private static async Task WriteNullableAsync(
        NpgsqlBinaryImporter importer,
        string? value,
        CancellationToken ct
    )
    {
        if (value is null)
            await importer.WriteNullAsync(ct);
        else
            await importer.WriteAsync(value, NpgsqlDbType.Varchar, ct);
    }

    [Pure]
    private static LogEntryLevel LevelOf(LogEventLevel level) =>
        level switch
        {
            LogEventLevel.Fatal => LogEntryLevel.Fatal,
            LogEventLevel.Error => LogEntryLevel.Error,
            LogEventLevel.Warning => LogEntryLevel.Warning,
            _ => LogEntryLevel.Information,
        };

    [Pure]
    private static string Truncated(string text, int maxLength) =>
        text.Length <= maxLength ? text : text[..maxLength];
}
