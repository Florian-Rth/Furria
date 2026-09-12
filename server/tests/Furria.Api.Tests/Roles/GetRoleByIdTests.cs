using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class GetRoleByIdTests
{
    private const int UnknownRoleId = 999_999;

    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private static readonly DateOnly TookOverAgain2022 = new(2022, 1, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetRoleByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetRoleByIdResponse>> ReadRoleAsync(
        HttpClient client,
        int roleId
    ) =>
        client.GETAsync<GetRoleById, GetRoleByIdRequest, GetRoleByIdResponse>(
            new GetRoleByIdRequest { RoleId = roleId }
        );

    [Fact]
    public async Task Should_SplitRunningAndPastInhaber_When_ARolleIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("katrin", "Katrin", "Adam")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "gruppenpflege",
                                "Gruppenpflege",
                                "Pflegt die Gruppen des Vereins.",
                                archivedOn: null,
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleHolding(
                                "ilka-gruppenpflege",
                                "gruppenpflege",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                            .AddRoleHolding(
                                "katrin-gruppenpflege",
                                "gruppenpflege",
                                "katrin",
                                TookOverAgain2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("gruppenpflege"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Gruppenpflege", result.Name);
        Assert.Equal("Pflegt die Gruppen des Vereins.", result.Description);
        Assert.Null(result.ArchivedOn);
        Assert.Equal([FurriaPermissions.GroupsManage], result.PermissionKeys);

        var katrin = Assert.Single(result.Holders);
        Assert.Equal(ctx.Roles.RoleHoldings.IdOf("katrin-gruppenpflege"), katrin.RoleHoldingId);
        Assert.Equal(ctx.Identity.People.IdOf("katrin"), katrin.PersonId);
        Assert.Equal(TookOverAgain2022, katrin.SinceOn);
        Assert.Null(katrin.UntilOn);
        Assert.Equal(TookOverAgain2022, katrin.Since);

        var ilka = Assert.Single(result.PastHolders);
        Assert.Equal(ctx.Roles.RoleHoldings.IdOf("ilka-gruppenpflege"), ilka.RoleHoldingId);
        Assert.Equal(HeldSince2017, ilka.SinceOn);
        Assert.Equal(HandedOver2020, ilka.UntilOn);
    }

    [Fact]
    public async Task Should_SayTheInhaberinHasNoKarte_When_TheRolleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "chronistin",
                                "Chronistin",
                                "Schreibt die Chronik.",
                                ArchivedIn2021
                            )
                            .AddRoleHolding("ilka-chronistin", "chronistin", "ilka", HeldSince2017)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("chronistin"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(Assert.Single(result.Holders).IsAffiliated);
    }

    [Fact]
    public async Task Should_ReportTheChainMinimum_When_AnInhaberinHeldTheRolleTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRoleHolding(
                                "ilka-first",
                                "gruppenpflege",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                            .AddRoleHolding(
                                "ilka-second",
                                "gruppenpflege",
                                "ilka",
                                TookOverAgain2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("gruppenpflege"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var running = Assert.Single(result.Holders);
        Assert.Equal(TookOverAgain2022, running.SinceOn);
        Assert.Equal(HeldSince2017, running.Since);
    }

    [Fact]
    public async Task Should_ReturnTheRolle_When_ItIsArchived()
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
        var (response, result) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ArchivedIn2021, result.ArchivedOn);
    }

    [Fact]
    public async Task Should_ReportAnEmptyRolle_When_NobodyHoldsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("zeugwart", "Zeugwart")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("zeugwart"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Holders);
        Assert.Empty(result.PastHolders);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRolleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await ReadRoleAsync(client, UnknownRoleId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await ReadRoleAsync(client, 0);

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
        var (response, _) = await ReadRoleAsync(client, ctx.Roles.Roles.IdOf("gruppenpflege"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("zeugwart", "Zeugwart")),
            ct
        );

        var (response, _) = await ReadRoleAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("zeugwart")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
