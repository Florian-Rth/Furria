using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PutGroupKindTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Diese Gruppenart gibt es schon.";
    private const string ArchivedKindMessage =
        "Eine archivierte Gruppenart kann nicht bearbeitet werden.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RenameKindAsync(
        HttpClient client,
        int groupKindId,
        string name
    ) =>
        client.PUTAsync<PutGroupKind, PutGroupKindRequest>(
            new PutGroupKindRequest { GroupKindId = groupKindId, Name = name }
        );

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherRunningGroupKindCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind("garde", "Garde").AddGroupKind("elferrat", "Elferrat")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("elferrat"),
            "garde"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("elferrat"))
            .ToHaveName("Elferrat")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupKindIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("spielmannszug"),
            "Spielmannszüge"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedKindMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToHaveName("Spielmannszug")
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
