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
public sealed class EndRoleHoldingTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string EndedHoldingMessage = "Diese Inhaberschaft ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Eine Inhaberschaft kann nicht vor ihrem Beginn enden.";
    private const int UnknownRoleHoldingId = 999_999;

    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);

    private readonly ApiTestFixture _fixture;

    public EndRoleHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> EndHoldingAsync(
        HttpClient client,
        int roleId,
        int roleHoldingId,
        DateOnly endedOn
    ) =>
        client.POSTAsync<EndRoleHolding, EndRoleHoldingRequest>(
            new EndRoleHoldingRequest
            {
                RoleId = roleId,
                RoleHoldingId = roleHoldingId,
                EndedOn = endedOn,
            }
        );

    [Fact]
    public async Task Should_CloseThePeriod_When_AManagerEndsTheInhaberschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CloseThePeriod_When_TheEndIsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var handsOverTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            handsOverTomorrow
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, handsOverTomorrow)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndOnItsOwnStart_When_TheInhaberschaftLastedOneDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HeldSince2017)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInhaberschaftIsAlreadyEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020.AddDays(1)
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EndedHoldingMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HeldSince2017.AddDays(-1)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([EndBeforeStartMessage], failures[ValidationField]);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheInhaberschaftIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            UnknownRoleHoldingId,
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheInhaberschaftBelongsToAnotherRolle()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRole("zeugwart", "Zeugwart")
                            .AddRoleHolding("ilka-chronik", "chronik", "ilka", HeldSince2017)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("zeugwart"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            0,
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding("ilka-chronik", "chronik", "ilka", HeldSince2017)
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "katrin-gruppenpflege",
                                "Gruppenpflege",
                                "katrin",
                                FurriaPermissions.GroupsManage
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await EndHoldingAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithRunningInhaberschaftAsync(ct);

        var response = await EndHoldingAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Roles.RoleHoldings.IdOf("ilka-chronik"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithRunningInhaberschaftAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
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
