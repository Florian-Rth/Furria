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
public sealed class ArchiveRoleTests
{
    private const string ConflictField = "conflict";
    private const string AlreadyArchivedMessage = "Diese Rolle ist bereits archiviert.";
    private const int UnknownRoleId = 999_999;

    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public ArchiveRoleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> ArchiveRoleAsync(HttpClient client, int roleId) =>
        client.POSTAsync<ArchiveRole, ArchiveRoleRequest>(
            new ArchiveRoleRequest { RoleId = roleId }
        );

    [Fact]
    public async Task Should_StampToday_When_AManagerArchivesTheRole()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("chronik", "Chronik")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToBeArchivedOn(_fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveEveryRoleHoldingUntouched_When_TheRoleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding("ilka-chronik", "chronik", "ilka", HeldSince2017)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, null)
            .RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StopGrantingItsKeys_When_TheRoleIsArchived()
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
        var (granted, _) = await ilka.GETAsync<GetRoles, GetRolesResponse>();
        Assert.Equal(HttpStatusCode.OK, granted.StatusCode);

        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var archived = await ArchiveRoleAsync(admin, ctx.Roles.Roles.IdOf("rollenpflege"));
        Assert.Equal(HttpStatusCode.NoContent, archived.StatusCode);

        var (afterwards, _) = await ilka.GETAsync<GetRoles, GetRolesResponse>();
        Assert.Equal(HttpStatusCode.Forbidden, afterwards.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRoleIsAlreadyArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRoleWithDetails(
                        "chronik",
                        "Chronik",
                        "Führt die Vereinschronik.",
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([AlreadyArchivedMessage], failures[ConflictField]);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRoleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveRoleAsync(client, UnknownRoleId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveRoleAsync(client, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithGroupCareHolderAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await ArchiveRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("chronik", "Chronik")),
            ct
        );

        var response = await ArchiveRoleAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("chronik")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithGroupCareHolderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "ilka-gruppenpflege",
                                "Gruppenpflege",
                                "ilka",
                                FurriaPermissions.GroupsManage
                            )
                    ),
            ct
        );

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
