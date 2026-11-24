using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class RestoreGroupKindTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Diese Gruppenart gibt es schon.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RestoreKindAsync(HttpClient client, int groupKindId) =>
        client.POSTAsync<RestoreGroupKind, RestoreGroupKindRequest>(
            new RestoreGroupKindRequest { GroupKindId = groupKindId }
        );

    [Fact]
    public async Task Should_ReturnConflict_When_ARunningGroupKindTookTheNameMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("alter-zug", "Spielmannszug", ArchivedIn2021)
                        .AddGroupKind("neuer-zug", "Spielmannszug")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreKindAsync(client, ctx.Groups.GroupKinds.IdOf("alter-zug"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("alter-zug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
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
