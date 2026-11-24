using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

public sealed class GetRolesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private readonly ApiTestFixture _fixture;

    public GetRolesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OmitTheHolder_When_HerRoleHoldingHasEnded()
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
                            .AddRole("gruppenpflege", "Gruppenpflege")
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
                                HandedOver2020.AddDays(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var katrin = Assert.Single(Single(result, "Gruppenpflege").Holders);
        Assert.Equal(ctx.Identity.People.IdOf("katrin"), katrin.PersonId);
    }

    [Fact]
    public async Task Should_CountNoSeat_When_TheSeatHasEndedOrNotYetBegun()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("katrin", "Katrin", "Adam")
                    )
                    .Roles(roles => roles.AddRole("vorstand", "Vorstand"))
                    .Club(club =>
                        club.AddBoardOffice("beisitz", "Beisitz", impliedRoleAlias: "vorstand")
                            .AddBoardSeat(
                                "ilka-beisitz",
                                "beisitz",
                                "ilka",
                                today.AddDays(-60),
                                today.AddDays(-1)
                            )
                            .AddBoardSeat("katrin-beisitz", "beisitz", "katrin", today.AddDays(1))
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var office = Assert.Single(Single(result, "Vorstand").ImpliedBy);
        Assert.Equal(0, office.SeatedCount);
    }

    private static RoleSummaryDto Single(GetRolesResponse response, string name) =>
        Assert.Single(response.Roles, role => role.Name == name);
}
