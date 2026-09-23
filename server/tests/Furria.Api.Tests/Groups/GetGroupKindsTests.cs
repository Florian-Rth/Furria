using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupKindsTests
{
    private const string GroupKindsRoute = "/api/group-kinds";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupKindsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheGroupKindsAsGerman_When_AnAffiliatedPersonReadsThePicker()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("elferrat", "Elferrat")
                            .AddGroupKind("garde", "Garde")
                            .AddGroupKind("aeltestenrat", "Ältestenrat")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string[] inOrder = ["Ältestenrat", "Elferrat", "Garde"];
        Assert.Equal(inOrder, result.Kinds.Select(kind => kind.Name));
    }

    [Fact]
    public async Task Should_OmitTheGroupKind_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("garde", "Garde")
                            .AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var garde = Assert.Single(result.Kinds);
        Assert.Equal(ctx.Groups.GroupKinds.IdOf("garde"), garde.GroupKindId);
    }

    [Fact]
    public async Task Should_ListTheGroupKinds_When_TheCallerIsTiedToTheClubByAGroupMembershipOnly()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroupKind("garde", "Garde")
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("anna-tanzgarde", "tanzgarde", "anna", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var garde = Assert.Single(result.Kinds);
        Assert.Equal("Garde", garde.Name);
    }

    [Fact]
    public async Task Should_CarryTheIdAndTheNameOnly_When_ThePickerIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(GroupKindsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var garde = document.RootElement.GetProperty("kinds").EnumerateArray().Single();
        Assert.Equal(["groupKindId", "name"], garde.EnumerateObject().Select(field => field.Name));
    }

    [Fact]
    public async Task Should_ListTheGroupKinds_When_TheCallerOnlyAdministersAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("trixi"))
                    .Groups(groups =>
                        groups
                            .AddGroupKind("garde", "Garde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin("trixi-leitet", "kindergarde", "trixi", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("trixi", ct);
        var (response, result) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var garde = Assert.Single(result.Kinds);
        Assert.Equal("Garde", garde.Name);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("tom"))
                    .Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await client.GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetGroupKinds, GetGroupKindsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
