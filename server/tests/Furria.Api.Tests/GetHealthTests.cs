using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class GetHealthTests
{
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
        Assert.Equal("0.1.0", result.Version);
    }
}
