using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Errors;

public sealed class FailureAnswerTests : IClassFixture<ApiTestFixture>
{
    private const string UnreachableDatabase =
        "Host=127.0.0.1;Port=1;Database=furria;Username=furria;Password=furria;Timeout=1";
    private const string ProblemJson = "application/problem+json";

    private readonly ApiTestFixture _fixture;

    public FailureAnswerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerAServiceUnavailableProblemWithRetryAfter_When_TheDatabaseIsUnreachable()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = _fixture.HostOnDatabase(UnreachableDatabase);

        var (response, _) = await host.CreateClient()
            .POSTAsync<Refresh, RefreshRequest, JsonElement>(
                new RefreshRequest { RefreshToken = OpaqueTokenSecret.Generate(out _) }
            );

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        Assert.NotNull(response.Headers.RetryAfter?.Delta);
        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        Assert.Equal(503, problem.RootElement.GetProperty("status").GetInt32());
        Assert.Matches("^[0-9a-f]{32}$", problem.RootElement.GetProperty("traceId").GetString());
    }

    [Fact]
    public async Task Should_AnswerServiceUnavailableNotUnauthorized_When_TheDatabaseIsUnreachableForASignedInCaller()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        await using var host = _fixture.HostOnDatabase(UnreachableDatabase);
        var client = host.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );

        var (response, _) = await client.GETAsync<GetMe, JsonElement>();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerTheRequestsOwnStatusAsProblem_When_TheRequestIsMalformed()
    {
        var ct = TestContext.Current.CancellationToken;

        var (response, _) = await _fixture.CreateClient().GETAsync<BadRequestProbe, JsonElement>();

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        Assert.Equal(413, problem.RootElement.GetProperty("status").GetInt32());
    }

    [Theory]
    [InlineData(LostWriteRaceProbe.ConcurrentChange)]
    [InlineData(LostWriteRaceProbe.VanishedReference)]
    [InlineData(LostWriteRaceProbe.TakenUniqueValue)]
    [InlineData(LostWriteRaceProbe.BulkTakenUniqueValue)]
    public async Task Should_AnswerAConflictRefusal_When_AWriteLosesARaceNoServiceAnticipated(
        string race
    )
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await _fixture
            .CreateClient()
            .GetAsync($"/api/tests/lost-write-race-probe/{race}", ct);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var refusal = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal([WriteConflictMessages.ChangedMeanwhile], refusal?.Errors["conflict"]);
    }
}
