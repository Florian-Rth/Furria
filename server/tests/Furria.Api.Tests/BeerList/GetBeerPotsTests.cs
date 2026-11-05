using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerPotsTests : IClassFixture<ApiTestFixture>
{
    private const string Successor = "otto";
    private const string HandedOverPot = "alter-topf";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetBeerPotsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheOpenPotFirstAndHandedOverPotsWithWhatIsStillOwed_When_AnOperatorReads()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var handedOverAt = now.AddDays(-40);
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity.AddPerson(Successor, "Otto", "Ott").AddAccount(Successor)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schankhilfe",
                            "otto-schankhilfe",
                            "Schankhilfe",
                            Successor,
                            FurriaPermissions.BeerListManage
                        )
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                HandedOverPot,
                                Warden,
                                OldPrice,
                                openedAt: now.AddDays(-200),
                                closedAt: handedOverAt
                            )
                            .AddBeerPot(Pot, Successor, Price, openedAt: handedOverAt)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(HandedOverPot, Drinker, 3, now.AddDays(-60))
                            .AddBeerCrates(HandedOverPot, Warden, 1, now.AddDays(-50))
                            .AddBeerCrate(
                                "zurueck",
                                HandedOverPot,
                                Drinker,
                                now.AddDays(-45),
                                undoneAt: now.AddDays(-45)
                            )
                            .AddBeerPayment("bezahlt", HandedOverPot, Drinker, 1)
                            .AddBeerCrates(Pot, Drinker, 1, now.AddDays(-2))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Successor, ct);
        var (response, result) = await client.GETAsync<GetBeerPots, GetBeerPotsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                (
                    ctx.BeerList.Pots.IdOf(Pot),
                    (int?)ctx.Identity.People.IdOf(Successor),
                    Price,
                    handedOverAt,
                    (DateTimeOffset?)null,
                    1,
                    1,
                    Price
                ),
                (
                    ctx.BeerList.Pots.IdOf(HandedOverPot),
                    ctx.Identity.People.IdOf(Warden),
                    OldPrice,
                    now.AddDays(-200),
                    handedOverAt,
                    2,
                    3,
                    3 * OldPrice
                ),
            ],
            result.Pots.Select(pot =>
                (
                    pot.BeerPotId,
                    pot.Owner?.PersonId,
                    pot.CratePriceCents,
                    pot.OpenedAt,
                    pot.ClosedAt,
                    pot.OpenTabs,
                    pot.OpenCrates,
                    pot.OpenCents
                )
            )
        );
    }
}
