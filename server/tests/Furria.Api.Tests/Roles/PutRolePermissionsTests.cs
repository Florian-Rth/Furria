using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class PutRolePermissionsTests
{
    private const string ConflictField = "conflict";
    private const string UnknownKeyMessage = "Unbekannter Berechtigungs-Key.";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle kann nicht bearbeitet werden.";
    private const int UnknownRoleId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutRolePermissionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> SetKeysAsync(
        HttpClient client,
        int roleId,
        params string[] permissionKeys
    ) =>
        client.PUTAsync<PutRolePermissions, PutRolePermissionsRequest>(
            new PutRolePermissionsRequest { RoleId = roleId, PermissionKeys = permissionKeys }
        );

    [Fact]
    public async Task Should_ReplaceTheWholeSet_When_AManagerSetsTheKeys()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            FurriaPermissions.PersonsManage,
            FurriaPermissions.PersonsReadDetails
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.PersonsManage, FurriaPermissions.PersonsReadDetails)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearEveryKey_When_TheNewSetIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole(
                        "gruppenpflege",
                        "Gruppenpflege",
                        FurriaPermissions.GroupsManage,
                        FurriaPermissions.PersonsReadDetails
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(client, ctx.Roles.Roles.IdOf("gruppenpflege"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheUnchangedKey_When_OneKeyIsAdded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            FurriaPermissions.GroupsManage,
            FurriaPermissions.PersonsReadDetails
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage, FurriaPermissions.PersonsReadDetails)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LockHerOutImmediately_When_AManagerDropsRolesManageFromHerOwnRolle()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "rollenpflege",
                            "ilka-rollenpflege",
                            "Rollenpflege",
                            "ilka",
                            FurriaPermissions.RolesManage
                        )
                    ),
            ct
        );

        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var dropped = await SetKeysAsync(ilka, ctx.Roles.Roles.IdOf("rollenpflege"));
        Assert.Equal(HttpStatusCode.NoContent, dropped.StatusCode);

        var (afterwards, _) = await ilka.GETAsync<GetRoles, GetRolesResponse>();
        Assert.Equal(HttpStatusCode.Forbidden, afterwards.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_AKeyIsNotInTheCatalogue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithGruppenpflegeAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            "finanzen.alles"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains(UnknownKeyMessage, await ReadMessagesAsync(response, ct));
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_AKeyIsListedTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithGruppenpflegeAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            FurriaPermissions.PersonsManage,
            FurriaPermissions.PersonsManage
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRolleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(client, UnknownRoleId, FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRolleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRoleWithDetails(
                        "chronik",
                        "Chronik",
                        "Führt die Vereinschronik.",
                        ArchivedIn2021,
                        FurriaPermissions.GroupsManage
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            FurriaPermissions.PersonsManage
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedRoleMessage], failures[ConflictField]);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetKeysAsync(client, 0, FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await SetKeysAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            FurriaPermissions.RolesManage
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithGruppenpflegeAsync(ct);

        var response = await SetKeysAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            FurriaPermissions.RolesManage
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithGruppenpflegeAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

    private static async Task<IReadOnlyList<string>> ReadMessagesAsync(
        HttpResponseMessage response,
        CancellationToken ct
    ) => [.. (await ReadFailuresAsync(response, ct)).Values.SelectMany(messages => messages)];

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
