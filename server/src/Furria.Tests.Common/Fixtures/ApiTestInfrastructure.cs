using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Testcontainers.PostgreSql;
using Xunit;

namespace Furria.Tests.Common.Fixtures;

public sealed class ApiTestInfrastructure : IAsyncLifetime
{
    private const string ReuseLabel = "furria.tests";
    private const string ReuseLabelValue = "reused";
    private const string MaxConnections = "max_connections=1000";
    private const int MailpitSmtpPort = 1025;
    private const int MailpitApiPort = 8025;
    private const string NotStarted = "ApiTestInfrastructure has not been started yet.";

    private readonly PostgreSqlContainer _reusedPostgres = new PostgreSqlBuilder(
        "postgres:18.6-alpine"
    )
        .WithCommand("-c", MaxConnections)
        .WithReuse(true)
        .WithLabel(ReuseLabel, ReuseLabelValue)
        .Build();

    private readonly IContainer _reusedMailpit = new ContainerBuilder("axllent/mailpit:v1.27")
        .WithPortBinding(MailpitSmtpPort, assignRandomHostPort: true)
        .WithPortBinding(MailpitApiPort, assignRandomHostPort: true)
        .WithWaitStrategy(
            Wait.ForUnixContainer()
                .UntilInternalTcpPortIsAvailable(MailpitSmtpPort)
                .UntilHttpRequestIsSucceeded(request =>
                    request.ForPort(MailpitApiPort).ForPath("/readyz")
                )
        )
        .WithReuse(true)
        .WithLabel(ReuseLabel, ReuseLabelValue)
        .Build();

    private MailpitInbox? _mailbox;
    private TestDatabaseCatalog? _catalog;

    private TestDatabaseCatalog Catalog =>
        _catalog ?? throw new InvalidOperationException(NotStarted);

    public MailpitInbox Mailbox => _mailbox ?? throw new InvalidOperationException(NotStarted);

    public string MailpitHost => _reusedMailpit.Hostname;

    public ushort MailpitSmtpPublicPort => _reusedMailpit.GetMappedPublicPort(MailpitSmtpPort);

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(_reusedPostgres.StartAsync(), _reusedMailpit.StartAsync());
        _mailbox = new MailpitInbox(
            new UriBuilder(
                Uri.UriSchemeHttp,
                _reusedMailpit.Hostname,
                _reusedMailpit.GetMappedPublicPort(MailpitApiPort)
            ).Uri
        );
        _catalog = await TestDatabaseCatalog.OpenAsync(
            _reusedPostgres.GetConnectionString(),
            CancellationToken.None
        );
    }

    public Task<string> CreateDatabaseFromTemplateAsync(CancellationToken ct = default) =>
        Catalog.CreateLaneAsync(ct);

    public Task<string> CreateEmptyDatabaseAsync(CancellationToken ct = default) =>
        Catalog.CreateEmptyAsync(ct);

    public Task DropDatabaseAsync(string connectionString) => Catalog.DropAsync(connectionString);

    public async ValueTask DisposeAsync()
    {
        _mailbox?.Dispose();
        if (_catalog is not null)
            await _catalog.DisposeAsync();
    }
}
