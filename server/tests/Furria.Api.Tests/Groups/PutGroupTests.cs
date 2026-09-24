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
public sealed class PutGroupTests
{
    private const string ConflictField = "conflict";
    private const string OldDescription = "Die Garde tanzt seit 1971.";
    private const int UnknownGroupId = 999_999;
    private const string GroupsRoute = "/api/manage/groups";
    private const string BodyWithoutGroupKind =
        "{\"name\":\"Große Garde\",\"description\":\"Wir tanzen dienstags und donnerstags.\",\"isRecruiting\":true}";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenameTheGroupAndLeaveItsOwnRecordAlone_When_TheKeyHolderSaves()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Name = "Große Garde",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("Große Garde")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeRecruiting(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheName_When_OnlyItsCaseChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Name = "TANZGARDE",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("TANZGARDE")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherActiveGroupCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                        .AddGroup("elferrat", "Elferrat")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("elferrat"),
                Name = "tanzgarde",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("elferrat"))
            .ToHaveName("Elferrat")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheName_When_OnlyAnArchivedGroupCarriesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup(
                            "tanzgarde-retired",
                            "Tanzgarde",
                            "Die alte Garde.",
                            isRecruiting: false,
                            ArchivedIn2021
                        )
                        .AddGroup("elferrat", "Elferrat")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("elferrat"),
                Name = "Tanzgarde",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("elferrat"))
            .ToHaveName("Tanzgarde")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        OldDescription,
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("kindergarde"),
                Name = "Kindergarde neu",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToHaveName("Kindergarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = UnknownGroupId,
                Name = "Elferrat",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Name = "",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("Tanzgarde")
            .AssertAsync(ct);
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
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription))
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
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Name = "Große Garde",
                GroupKindId = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("Tanzgarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutGroup, PutGroupRequest>(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    Name = "Große Garde",
                    GroupKindId = null,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheGroupKind_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("spielmannszug", "Spielmannszug", archivedOn: ArchivedIn2021)
                        .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PUTAsync<PutGroup, PutGroupRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Name = "Tanzgarde",
                GroupKindId = ctx.Groups.GroupKinds.IdOf("spielmannszug"),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppenart lässt sich einer Gruppe nicht zuordnen."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveGroupKind(null)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheGroup_When_TheBodyLeavesTheGroupKindOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("garde", "Garde")
                        .AddGroup("tanzgarde", "Tanzgarde", OldDescription, groupKindAlias: "garde")
                ),
            ct
        );
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.PutAsync(
            $"{GroupsRoute}/{tanzgarde}",
            new StringContent(BodyWithoutGroupKind, Encoding.UTF8, MediaTypeNames.Application.Json),
            ct
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(tanzgarde)
            .ToHaveName("Große Garde")
            .Group(tanzgarde)
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
