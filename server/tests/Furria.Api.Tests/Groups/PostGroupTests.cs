using System.Net;
using System.Net.Http.Json;
using System.Net.Mime;
using System.Text;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PostGroupTests
{
    private const string ConflictField = "conflict";
    private const string GroupsRoute = "/api/manage/groups";
    private const string BodyWithoutGruppenart =
        "{\"name\":\"Die Biergarde\",\"description\":\"Wir proben freitags.\",\"isRecruiting\":true}";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateTheGruppe_When_TheKeyHolderAnlegtSie()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostGroup,
            PostGroupRequest,
            PostGroupResponse
        >(new() { Name = "Musik & Kapelle", GroupKindId = null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Group(result.GroupId)
            .ToHaveName("Musik & Kapelle")
            .Group(result.GroupId)
            .ToHaveDescription("")
            .Group(result.GroupId)
            .ToBeRecruiting(false)
            .Group(result.GroupId)
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnActiveGruppeCarriesTheNameInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new() { Name = "tanzgarde", GroupKindId = null }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_CreateTheGruppe_When_OnlyAnArchivedGruppeCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "tanzgarde-retired",
                        "Tanzgarde",
                        "Die alte Garde.",
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostGroup,
            PostGroupRequest,
            PostGroupResponse
        >(new() { Name = "Tanzgarde", GroupKindId = null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Group(result.GroupId)
            .ToHaveName("Tanzgarde")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new() { Name = "", GroupKindId = null }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsLongerThanTheColumn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new() { Name = new string('a', 81), GroupKindId = null }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schriftfuehrung",
                            "ilka-schriftfuehrung",
                            "Schriftführung",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new() { Name = "Technik & Bühne", GroupKindId = null }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
                new() { Name = "Technik & Bühne", GroupKindId = null }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheGruppenart_When_SieArchiviertIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind(
                        "spielmannszug",
                        "Spielmannszug",
                        archivedOn: ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<PostGroup, PostGroupRequest, PostGroupResponse>(
            new()
            {
                Name = "Spielmannszug",
                GroupKindId = ctx.Groups.GroupKinds.IdOf("spielmannszug"),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppenart lässt sich einer Gruppe nicht zuordnen."],
            failures[ConflictField]
        );
    }

    [Fact]
    public async Task Should_CreateTheGruppe_When_TheBodyLeavesTheGruppenartOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PostAsync(
            GroupsRoute,
            new StringContent(
                BodyWithoutGruppenart,
                Encoding.UTF8,
                MediaTypeNames.Application.Json
            ),
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<PostGroupResponse>(ct);
        Assert.NotNull(created);
        await ctx
            .Expected.Group(created.GroupId)
            .ToHaveName("Die Biergarde")
            .Group(created.GroupId)
            .ToHaveGroupKind(null)
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
