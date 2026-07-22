using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class DatabaseMigrationTests
{
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
}
