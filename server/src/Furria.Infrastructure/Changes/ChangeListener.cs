using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using System.Threading.Channels;
using Furria.Application.Changes;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Furria.Infrastructure.Changes;

public sealed class ChangeListener : BackgroundService
{
    private const string ListenCommand = $"LISTEN {ChangeNotifications.Channel}";

    public const string ApplicationName = "furria-change-listener";

    private static readonly TimeSpan CoalescingWindow = TimeSpan.FromMilliseconds(250);
    private static readonly TimeSpan LivenessCheckInterval = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan FirstReconnectDelay = TimeSpan.FromMilliseconds(500);
    private static readonly TimeSpan LongestReconnectDelay = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ChangeFeed _feed;
    private readonly ILogger<ChangeListener> _logger;

    public ChangeListener(
        IServiceScopeFactory scopeFactory,
        ChangeFeed feed,
        ILogger<ChangeListener> logger
    )
    {
        _scopeFactory = scopeFactory;
        _feed = feed;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var (connectionString, changesByTable) = ReadDatabase();
        var heard = Channel.CreateUnbounded<string>(
            new UnboundedChannelOptions { SingleReader = true }
        );
        try
        {
            await Task.WhenAll(
                ListenAsync(connectionString, heard.Writer, stoppingToken),
                PublishAsync(heard.Reader, changesByTable, stoppingToken)
            );
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
    }

    private (
        string ConnectionString,
        FrozenDictionary<string, IReadOnlyList<DomainChange>> ChangesByTable
    ) ReadDatabase()
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return (
            ListenerConnection(dbContext.Database.GetConnectionString()!),
            ChangedTables.ByTable(dbContext.Model)
        );
    }

    private async Task ListenAsync(
        string connectionString,
        ChannelWriter<string> heard,
        CancellationToken ct
    )
    {
        var reconnectDelay = FirstReconnectDelay;
        var hasListened = false;
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await using var connection = await OpenListeningAsync(connectionString, heard, ct);
                if (hasListened)
                    _feed.Publish(ChangeBatch.Everything);
                hasListened = true;
                reconnectDelay = FirstReconnectDelay;
                await StayListeningAsync(connection, ct);
            }
            catch (Exception exception) when (!ct.IsCancellationRequested)
            {
                _logger.LogWarning(
                    "Change listener lost the database, failure {FailureType}, reconnecting in {RetryDelay}",
                    exception.GetType().Name,
                    reconnectDelay
                );
                await Task.Delay(reconnectDelay, ct);
                reconnectDelay = Longer(reconnectDelay);
            }
        }
    }

    private static async Task<NpgsqlConnection> OpenListeningAsync(
        string connectionString,
        ChannelWriter<string> heard,
        CancellationToken ct
    )
    {
        var connection = new NpgsqlConnection(connectionString);
        try
        {
            connection.Notification += (_, notification) => heard.TryWrite(notification.Payload);
            await connection.OpenAsync(ct);
            await ListenOnAsync(connection, ct);
            return connection;
        }
        catch
        {
            await connection.DisposeAsync();
            throw;
        }
    }

    private static async Task StayListeningAsync(NpgsqlConnection connection, CancellationToken ct)
    {
        while (true)
        {
            if (!await connection.WaitAsync(LivenessCheckInterval, ct))
                await ListenOnAsync(connection, ct);
        }
    }

    private static async Task ListenOnAsync(NpgsqlConnection connection, CancellationToken ct)
    {
        await using var listen = new NpgsqlCommand(ListenCommand, connection);
        await listen.ExecuteNonQueryAsync(ct);
    }

    private async Task PublishAsync(
        ChannelReader<string> heard,
        FrozenDictionary<string, IReadOnlyList<DomainChange>> changesByTable,
        CancellationToken ct
    )
    {
        while (await heard.WaitToReadAsync(ct))
        {
            await Task.Delay(CoalescingWindow, ct);
            var tables = new HashSet<string>(StringComparer.Ordinal);
            while (heard.TryRead(out var table))
                tables.Add(table);

            if (ChangesOf(tables, changesByTable) is { Count: > 0 } changes)
                _feed.Publish(new ChangeBatch { Changes = changes });
        }
    }

    [Pure]
    private static IReadOnlyList<DomainChange> ChangesOf(
        IEnumerable<string> tables,
        FrozenDictionary<string, IReadOnlyList<DomainChange>> changesByTable
    ) =>
        [
            .. tables
                .SelectMany(table =>
                    changesByTable.TryGetValue(table, out var changes) ? changes : []
                )
                .Distinct()
                .Order(),
        ];

    [Pure]
    private static string ListenerConnection(string connectionString) =>
        new NpgsqlConnectionStringBuilder(connectionString)
        {
            ApplicationName = ApplicationName,
            Pooling = false,
        }.ConnectionString;

    [Pure]
    private static TimeSpan Longer(TimeSpan delay) =>
        TimeSpan.FromTicks(Math.Min(delay.Ticks * 2, LongestReconnectDelay.Ticks));
}
