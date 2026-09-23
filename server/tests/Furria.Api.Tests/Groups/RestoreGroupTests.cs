using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class RestoreGroupTests
{
    private const string ConflictField = "conflict";
    private const string RetiredDescription = "Die alte Garde.";
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ClearTheArchivedOn_When_TheKeyHolderRestoresTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        RetiredDescription,
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(null)
            .Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToHaveName("Kindergarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Gruppe ist nicht archiviert."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherActiveGroupNowCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup(
                            "tanzgarde-retired",
                            "Tanzgarde",
                            RetiredDescription,
                            isRecruiting: false,
                            ArchivedIn2021
                        )
                        .AddGroup("tanzgarde", "tanzgarde")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde-retired") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = UnknownGroupId }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
                    .Groups(groups =>
                        groups.AddGroup(
                            "kindergarde",
                            "Kindergarde",
                            RetiredDescription,
                            isRecruiting: false,
                            ArchivedIn2021
                        )
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
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        RetiredDescription,
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .POSTAsync<RestoreGroup, RestoreGroupRequest>(
                new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheGroup_When_ItsGroupKindIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("spielmannszug", "Spielmannszug", archivedOn: ArchivedIn2021)
                        .AddGroup(
                            "spielleute",
                            "Spielleute",
                            RetiredDescription,
                            isRecruiting: false,
                            ArchivedIn2021,
                            groupKindAlias: "spielmannszug"
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("spielleute") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Die Gruppenart dieser Gruppe ist archiviert. "
                    + "Hole zuerst die Gruppenart zurück.",
            ],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("spielleute"))
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
