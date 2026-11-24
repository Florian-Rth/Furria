using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class GetOpenBeerPotTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly MemberSince2018 = new(2018, 4, 1);

    private readonly ApiTestFixture _fixture;

    public GetOpenBeerPotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData(2, 2, 0, false)]
    [InlineData(2, 1, 0, true)]
    [InlineData(2, 2, 1, true)]
    public async Task Should_SayOnlyWhetherACrateIsLeft_When_AnEnrolledMemberAsks(
        int deliveredCrates,
        int takenCrates,
        int undoneCrates,
        bool hasStock
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWardenAndDrinker(builder)
                    .BeerList(beerList =>
                        WithTakenCrates(
                            WithDelivery(
                                beerList
                                    .AddBeerPot("topf", "greta")
                                    .AddBeerListEnrollment("mira-bier", "mira"),
                                deliveredCrates,
                                now
                            ),
                            takenCrates,
                            undoneCrates,
                            now
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, result) = await client.GETAsync<GetOpenBeerPot, GetOpenBeerPotResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var pot = Assert.IsType<OpenBeerPotDetailsDto>(result.Pot);
        Assert.Equal(hasStock, Assert.Single(pot.Drinks).HasStock);
    }

    private static BeerListSeedBuilder WithDelivery(
        BeerListSeedBuilder beerList,
        int deliveredCrates,
        DateTimeOffset now
    ) =>
        deliveredCrates > 0
            ? beerList.AddBeerDelivery("topf", deliveredCrates, now.AddDays(-3))
            : beerList;

    private static BeerListSeedBuilder WithTakenCrates(
        BeerListSeedBuilder beerList,
        int takenCrates,
        int undoneCrates,
        DateTimeOffset now
    )
    {
        for (var index = 0; index < takenCrates; index++)
            beerList.AddBeerCrate(
                $"kiste-{index}",
                "topf",
                "mira",
                now.AddDays(-1),
                undoneAt: index < undoneCrates ? now.AddDays(-1) : null
            );

        return beerList;
    }

    private static SeedContextBuilder WithWardenAndDrinker(SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson("greta", "Greta", "Gruber")
                    .AddAccount("greta")
                    .AddAccount("mira")
                    .AddMembership("mira-first", "mira", MemberSince2018)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "getraenkewart",
                    "greta-getraenkewart",
                    "Getränkewart",
                    "greta",
                    FurriaPermissions.BeerListManage
                )
            );
}
