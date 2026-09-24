using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Logging;

[Collection("Api")]
public sealed class UnhandledExceptionTests
{
    private const string ProblemJson = "application/problem+json";

    private readonly ApiTestFixture _fixture;

    public UnhandledExceptionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerAProblemCarryingOnlyTheTraceId_When_AnEndpointThrows()
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await CallThrowingProbeAsync();

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadAsStringAsync(ct);
        Assert.DoesNotContain(ThrowingProbe.FailureMessage, body, StringComparison.Ordinal);
        Assert.DoesNotContain(nameof(InvalidOperationException), body, StringComparison.Ordinal);
        Assert.Matches("^[0-9a-f]{32}$", TraceIdOf(body));
    }

    [Fact]
    public async Task Should_WriteOneErrorEventCarryingTheException_When_AnEndpointThrows()
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await CallThrowingProbeAsync();

        var traceId = TraceIdOf(await response.Content.ReadAsStringAsync(ct));
        var written = Assert.Single(
            _fixture.Logs.All(),
            logged =>
                logged.Level >= LogEventLevel.Error && logged.TraceId?.ToHexString() == traceId
        );
        var exception = Assert.IsType<InvalidOperationException>(written.Exception);
        Assert.Equal(ThrowingProbe.FailureMessage, exception.Message);
        Assert.Equal(500, written.ScalarOf("StatusCode"));
        Assert.Equal("/api/tests/throwing-probe", written.ScalarOf("RoutePattern"));
    }

    private async Task<HttpResponseMessage> CallThrowingProbeAsync()
    {
        var (response, _) = await _fixture.CreateClient().GETAsync<ThrowingProbe, JsonElement>();
        return response;
    }

    private static string TraceIdOf(string problemBody)
    {
        using var problem = JsonDocument.Parse(problemBody);
        return problem.RootElement.GetProperty("traceId").GetString() ?? string.Empty;
    }
}
