using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PostGroupKindTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Diese Gruppenart gibt es schon.";

    private readonly ApiTestFixture _fixture;

    public PostGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostGroupKindResponse>> CreateKindAsync(
        HttpClient client,
        string name
    ) =>
        client.POSTAsync<PostGroupKind, PostGroupKindRequest, PostGroupKindResponse>(
            new PostGroupKindRequest { Name = name }
        );

    [Fact]
    public async Task Should_ReturnConflict_When_TheNameIsAlreadyInTheBand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await CreateKindAsync(client, "garde");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
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
