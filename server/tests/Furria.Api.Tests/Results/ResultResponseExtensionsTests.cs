using System.Net;
using FastEndpoints;
using Furria.Application.Results;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Results;

public sealed class ResultResponseExtensionsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ResultResponseExtensionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(ResultErrorKind.NotFound, HttpStatusCode.NotFound)]
    [InlineData(ResultErrorKind.Validation, HttpStatusCode.UnprocessableEntity)]
    public async Task Should_AnswerWithTheMappedStatus_When_AResultFailed(
        ResultErrorKind kind,
        HttpStatusCode expected
    )
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .POSTAsync<ResultProbe, ResultProbeRequest>(new() { Kind = kind });

        Assert.Equal(expected, response.StatusCode);
    }
}
