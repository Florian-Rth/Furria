using System.Net;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

public sealed class OpenApiExposureTests : IClassFixture<ApiTestFixture>
{
    private const string OpenApiDocumentPath = "/swagger/v1/swagger.json";

    private readonly ApiTestFixture _fixture;

    public OpenApiExposureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PublishNoOpenApiDocument_When_TheHostIsNotDevelopment()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _fixture.CreateClient();

        var response = await client.GetAsync(OpenApiDocumentPath, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
