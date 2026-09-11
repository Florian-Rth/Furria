using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Application.Results;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Results;

[Collection("Api")]
public sealed class ResultResponseExtensionsTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";

    private readonly ApiTestFixture _fixture;

    public ResultResponseExtensionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(ResultErrorKind.NotFound, HttpStatusCode.NotFound)]
    [InlineData(ResultErrorKind.Conflict, HttpStatusCode.Conflict)]
    [InlineData(ResultErrorKind.Validation, HttpStatusCode.UnprocessableEntity)]
    [InlineData(ResultErrorKind.Forbidden, HttpStatusCode.Forbidden)]
    [InlineData(ResultErrorKind.Unauthorized, HttpStatusCode.Unauthorized)]
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

    [Fact]
    public async Task Should_AnswerWithNoContent_When_TheResultSucceeded()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .POSTAsync<ResultProbe, ResultProbeRequest>(new() { Kind = null });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryTheGermanMessageOnTheConflictField_When_TheResultIsAConflict()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .POSTAsync<ResultProbe, ResultProbeRequest>(new() { Kind = ResultErrorKind.Conflict });

        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ResultProbe.FailureMessage], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_CarryTheGermanMessageOnTheRequestField_When_TheResultIsAValidation()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await _fixture
            .CreateClient()
            .POSTAsync<ResultProbe, ResultProbeRequest>(
                new() { Kind = ResultErrorKind.Validation }
            );

        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ResultProbe.FailureMessage], failures[ValidationField]);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
