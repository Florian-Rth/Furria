using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class DatabaseMigrationTests
{
    private const string MigrationsApplied =
        "Applied {MigrationCount} migrations from {FirstMigration} to {LastMigration} in {ElapsedMs} ms";
    private const string SchemaUpToDate = "Database schema up to date at {CurrentMigration}";

    private readonly ApiTestFixture _fixture;

    public DatabaseMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ApplyMigrationsOnStartup_When_HostStarts()
    {
        var appliedMigrations = await _fixture.GetAppliedMigrationsAsync(
            TestContext.Current.CancellationToken
        );

        Assert.NotEmpty(appliedMigrations);
    }

    [Fact]
    public async Task Should_ReportEveryAppliedMigrationOnce_When_TheHostMigratesAFreshDatabase()
    {
        var appliedMigrations = await _fixture.GetAppliedMigrationsAsync(
            TestContext.Current.CancellationToken
        );

        var written = Assert.Single(_fixture.Logs.Written(MigrationsApplied));
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal(appliedMigrations.Count, written.ScalarOf("MigrationCount"));
        Assert.Equal(appliedMigrations[0], written.ScalarOf("FirstMigration"));
        Assert.Equal(appliedMigrations[^1], written.ScalarOf("LastMigration"));
    }

    [Fact]
    public async Task Should_ReportTheSchemaUpToDate_When_NoMigrationIsPending()
    {
        var ct = TestContext.Current.CancellationToken;
        var mark = _fixture.Logs.Mark();

        await _fixture.RunDatabaseMigratorAsync(ct);

        var appliedMigrations = await _fixture.GetAppliedMigrationsAsync(ct);
        var written = Assert.Single(_fixture.Logs.Written(SchemaUpToDate, mark));
        Assert.Equal(appliedMigrations[^1], written.ScalarOf("CurrentMigration"));
    }
}
