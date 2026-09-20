using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class GetRolesOverviewTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HeldSince2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HandedOverIn2022 = new(2022, 3, 1);

    private readonly ApiTestFixture _fixture;

    public GetRolesOverviewTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryDieLaufendenInhaber_When_EinMitgliedAlleRollenOeffnet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity)
                            .AddPerson("nadine", "Nadine", "Wolters")
                            .AddPerson("ilka", "Ilka", "Ärmel")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "notenwart",
                                "Notenwart",
                                "Hütet die Noten.",
                                archivedOn: null,
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleHolding(
                                "nadine-notenwart",
                                "notenwart",
                                "nadine",
                                HeldSince2020
                            )
                            .AddRoleHolding("ilka-notenwart", "notenwart", "ilka", HeldSince2017)
                    ),
            ct
        );

        var (response, result) = await OverviewForAsync(ctx, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var notenwart = Single(result, "Notenwart");
        Assert.Equal(ctx.Roles.Roles.IdOf("notenwart"), notenwart.RoleId);
        Assert.Equal("Hütet die Noten.", notenwart.Description);
        Assert.Equal(["Ärmel", "Wolters"], notenwart.Holders.Select(holder => holder.LastName));
        Assert.Equal(
            [HeldSince2017, HeldSince2020],
            notenwart.Holders.Select(holder => holder.SinceOn)
        );
        Assert.Equal(ctx.Identity.People.IdOf("ilka"), notenwart.Holders[0].PersonId);
        Assert.Equal("Ilka", notenwart.Holders[0].FirstName);
    }

    [Fact]
    public async Task Should_ElideDieRolle_When_SieArchiviertIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "notenwart",
                                "Notenwart",
                                "Hütete die Noten.",
                                ArchivedIn2021,
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleHolding(
                                "nadine-notenwart",
                                "notenwart",
                                "nadine",
                                HeldSince2017
                            )
                    ),
            ct
        );

        var (response, result) = await OverviewForAsync(ctx, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain(result.Roles, role => role.Name == "Notenwart");
    }

    [Fact]
    public async Task Should_ElideDenInhaber_When_SeineInhaberschaftBeendetIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        MemberNamedMira(identity).AddPerson("nadine", "Nadine", "Wolters")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("notenwart", "Notenwart", FurriaPermissions.GroupsManage)
                            .AddRoleHolding(
                                "nadine-notenwart",
                                "notenwart",
                                "nadine",
                                HeldSince2017,
                                HandedOverIn2022
                            )
                    ),
            ct
        );

        var (response, result) = await OverviewForAsync(ctx, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(Single(result, "Notenwart").Holders);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, _) = await client.GETAsync<GetRolesOverview, GetRolesOverviewResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetRolesOverview, GetRolesOverviewResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static IdentitySeedBuilder MemberNamedMira(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("mira", "Mira", "Buschmann")
            .AddAccount("mira")
            .AddMembership("mira-first", "mira", JoinedIn2017);

    private static RoleOverviewDto Single(GetRolesOverviewResponse response, string name) =>
        Assert.Single(response.Roles, role => role.Name == name);

    private static async Task<TestResult<GetRolesOverviewResponse>> OverviewForAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("mira", ct);
        return await client.GETAsync<GetRolesOverview, GetRolesOverviewResponse>();
    }
}
