using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

public sealed class GetHealthTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetHealthTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnServiceUnavailable_When_MigrationsArePending()
    {
        var emptyDatabase = await _fixture.CreateEmptyDatabaseAsync(
            TestContext.Current.CancellationToken
        );
        await using var host = _fixture.HostOnDatabase(emptyDatabase);

        var (response, result) = await host.CreateClient().GETAsync<GetHealth, GetHealthResponse>();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("unavailable", result.Status);
    }
}
