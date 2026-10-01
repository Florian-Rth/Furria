using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class GetHealthTests
{
    private const string UnreachableDatabase =
        "Host=127.0.0.1;Port=1;Database=furria;Username=furria;Password=furria;Timeout=1";
    private const string VersionPattern = @"^0\.2\.0(\+[0-9a-f]{7,40})?$";

    private readonly ApiTestFixture _fixture;

    public GetHealthTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnOkWithStatusAndVersion_When_HealthIsRequested()
    {
        var client = _fixture.CreateClient();

        var (response, result) = await client.GETAsync<GetHealth, GetHealthResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("ok", result.Status);
        Assert.Matches(VersionPattern, result.Version);
    }

    [Fact]
    public async Task Should_ReturnServiceUnavailable_When_TheDatabaseIsUnreachable()
    {
        await using var host = _fixture.HostOnDatabase(UnreachableDatabase);

        var (response, result) = await host.CreateClient().GETAsync<GetHealth, GetHealthResponse>();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("unavailable", result.Status);
        Assert.Matches(VersionPattern, result.Version);
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
