using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Furria.Infrastructure;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestInfrastructure : IAsyncLifetime
{
    private const string TemplateDatabase = "furria_template";
    private const string MaxConnections = "max_connections=1000";
    private const int MailpitSmtpPort = 1025;
    private const int MailpitApiPort = 8025;

    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18.6-alpine")
        .WithCommand("-c", MaxConnections)
        .Build();

    private readonly IContainer _mailpit = new ContainerBuilder("axllent/mailpit:v1.27")
        .WithPortBinding(MailpitSmtpPort, assignRandomHostPort: true)
        .WithPortBinding(MailpitApiPort, assignRandomHostPort: true)
        .WithWaitStrategy(
            Wait.ForUnixContainer()
                .UntilInternalTcpPortIsAvailable(MailpitSmtpPort)
                .UntilHttpRequestIsSucceeded(request =>
                    request.ForPort(MailpitApiPort).ForPath("/readyz")
                )
        )
        .Build();

    private MailpitInbox? _mailbox;

    public MailpitInbox Mailbox =>
        _mailbox
        ?? throw new InvalidOperationException("ApiTestInfrastructure has not been started yet.");

    public string MailpitHost => _mailpit.Hostname;

    public ushort MailpitSmtpPublicPort => _mailpit.GetMappedPublicPort(MailpitSmtpPort);

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(_postgres.StartAsync(), _mailpit.StartAsync());
        _mailbox = new MailpitInbox(
            new UriBuilder(
                Uri.UriSchemeHttp,
                _mailpit.Hostname,
                _mailpit.GetMappedPublicPort(MailpitApiPort)
            ).Uri
        );

        await ExecuteOnServerAsync($"CREATE DATABASE {TemplateDatabase}", CancellationToken.None);
        await MigrateTemplateAsync();
    }

    public Task<string> CreateDatabaseFromTemplateAsync(CancellationToken ct = default) =>
        CreateDatabaseAsync("furria_lane", $"TEMPLATE {TemplateDatabase}", ct);

    public Task<string> CreateEmptyDatabaseAsync(CancellationToken ct = default) =>
        CreateDatabaseAsync("furria_empty", string.Empty, ct);

    public async Task DropDatabaseAsync(string connectionString)
    {
        var database = new NpgsqlConnectionStringBuilder(connectionString).Database;
        await using (var connection = new NpgsqlConnection(connectionString))
            NpgsqlConnection.ClearPool(connection);

        await ExecuteOnServerAsync(
            $"DROP DATABASE IF EXISTS {database} WITH (FORCE)",
            CancellationToken.None
        );
    }

    public async ValueTask DisposeAsync()
    {
        _mailbox?.Dispose();
        await _postgres.DisposeAsync();
        await _mailpit.DisposeAsync();
    }

    private async Task<string> CreateDatabaseAsync(
        string prefix,
        string clause,
        CancellationToken ct
    )
    {
        var name = $"{prefix}_{Guid.NewGuid():N}";
        await ExecuteOnServerAsync($"CREATE DATABASE {name} {clause}", ct);
        return ConnectionStringTo(name);
    }

    private async Task MigrateTemplateAsync()
    {
        var templateConnection = ConnectionStringTo(TemplateDatabase);
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    [$"ConnectionStrings:{AppDbContext.ConnectionName}"] = templateConnection,
                }
            )
            .Build();

        await using (
            var services = new ServiceCollection()
                .AddLogging()
                .AddInfrastructure(configuration)
                .BuildServiceProvider()
        )
        {
            await using var scope = services.CreateAsyncScope();
            await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        }

        await using var templateClient = new NpgsqlConnection(templateConnection);
        NpgsqlConnection.ClearPool(templateClient);
    }

    private async Task ExecuteOnServerAsync(string statement, CancellationToken ct)
    {
        await using var connection = new NpgsqlConnection(_postgres.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var command = connection.CreateCommand();
        command.CommandText = statement;
        await command.ExecuteNonQueryAsync(ct);
    }

    private string ConnectionStringTo(string database) =>
        new NpgsqlConnectionStringBuilder(_postgres.GetConnectionString())
        {
            Database = database,
        }.ConnectionString;
}
