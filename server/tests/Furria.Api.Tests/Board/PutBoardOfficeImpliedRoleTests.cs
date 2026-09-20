using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

[Collection("Api")]
public sealed class PutBoardOfficeImpliedRoleTests
{
    private const string ConflictField = "conflict";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle lässt sich einer Vorstandsfunktion nicht zuordnen.";
    private const int UnknownBoardOfficeId = 999_999;
    private const int UnknownRoleId = 999_999;

    private static readonly DateOnly Elected2016 = new(2016, 11, 11);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutBoardOfficeImpliedRoleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> SetImpliedRoleAsync(
        HttpClient client,
        int boardOfficeId,
        int? roleId
    ) =>
        client.PUTAsync<PutBoardOfficeImpliedRole, PutBoardOfficeImpliedRoleRequest>(
            new PutBoardOfficeImpliedRoleRequest
            {
                BoardOfficeId = boardOfficeId,
                ImpliedRoleId = roleId,
            }
        );

    [Fact]
    public async Task Should_PointTheFunktionAtTheRolle_When_TheCallerHoldsRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAndRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Roles.Roles.IdOf("vereinsleitung")
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyRole(ctx.Roles.Roles.IdOf("vereinsleitung"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearTheRolle_When_TheFunktionShouldImplyNothing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Roles(roles => roles.AddRole("vereinsleitung", "Vereinsleitung"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, "vereinsleitung")
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            null
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsBoardManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBoardManagerAsync(ct);

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Roles.Roles.IdOf("allmacht")
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheCallerWithoutRolesManage_When_SheTriesToSeatHerselfIntoIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBoardManagerAsync(ct);

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var pointed = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Roles.Roles.IdOf("allmacht")
        );
        var seated = await client.POSTAsync<
            PostBoardSeat,
            PostBoardSeatRequest,
            PostBoardSeatResponse
        >(
            new PostBoardSeatRequest
            {
                BoardOfficeId = ctx.Club.BoardOffices.IdOf("praesident"),
                PersonId = ctx.Identity.People.IdOf("katrin"),
                SinceOn = Elected2016,
            }
        );
        var (readRoles, _) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, pointed.StatusCode);
        Assert.Equal(HttpStatusCode.OK, seated.Response.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, readRoles.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .BoardSeat(seated.Result.BoardSeatId)
            .ToBeHeldBy(ctx.Identity.People.IdOf("katrin"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRolleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAndRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            UnknownRoleId
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRolleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Roles(roles =>
                        roles.AddRoleWithDetails(
                            "chronik",
                            "Chronik",
                            "Führt die Vereinschronik.",
                            ArchivedIn2021
                        )
                    )
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Roles.Roles.IdOf("chronik")
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedRoleMessage], failures[ConflictField]);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheFunktionIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Roles(roles => roles.AddRole("vereinsleitung", "Vereinsleitung"))
                    .Club(club =>
                        club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            ctx.Club.BoardOffices.IdOf("pressewart"),
            ctx.Roles.Roles.IdOf("vereinsleitung")
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheFunktionIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAndRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(
            client,
            UnknownBoardOfficeId,
            ctx.Roles.Roles.IdOf("vereinsleitung")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAndRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await SetImpliedRoleAsync(client, 0, ctx.Roles.Roles.IdOf("vereinsleitung"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAndRolleAsync(ct);

        var response = await SetImpliedRoleAsync(
            _fixture.CreateClient(),
            ctx.Club.BoardOffices.IdOf("praesident"),
            ctx.Roles.Roles.IdOf("vereinsleitung")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("praesident"))
            .ToImplyNoRole()
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithBandAndRolleAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Roles(roles => roles.AddRole("vereinsleitung", "Vereinsleitung"))
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
            ct
        );

    private Task<SeededContext> BuildWithBoardManagerAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("katrin"))
                    .Roles(roles =>
                        roles
                            .AddRole(
                                "allmacht",
                                "Allmacht",
                                FurriaPermissions.RolesManage,
                                FurriaPermissions.PersonsManage
                            )
                            .AddRoleWithHolder(
                                "vorstandspflege",
                                "katrin-vorstandspflege",
                                "Vorstandspflege",
                                "katrin",
                                FurriaPermissions.BoardManage
                            )
                    )
                    .Club(club => club.AddBoardOffice("praesident", "Präsident", 1)),
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
