using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.Start;

public sealed class GetStartBeerTabTests : IClassFixture<ApiTestFixture>
{
    private const string FormerWarden = "otto";
    private const string OldPaymentNote = "Bar bei Otto";
    private const int OldPrice = 13_00;
    private const int Price = 15_00;

    private readonly ApiTestFixture _fixture;

    public GetStartBeerTabTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AskHerToPayEachOwnerHerOpenCrates_When_SheOwesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity => identity.AddPerson(FormerWarden, "Otto", "Ott"))
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                FormerWarden,
                                OldPrice,
                                paymentLink: null,
                                paymentNote: OldPaymentNote,
                                openedAt: now.AddDays(-300),
                                closedAt: now.AddDays(-40)
                            )
                            .AddBeerPot(Pot, Warden, Price, openedAt: now.AddDays(-40))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates("alter-topf", Drinker, 1, now.AddDays(-50))
                            .AddBeerCrate("bezahlt", Pot, Drinker, now.AddDays(-20))
                            .AddBeerCrate("offen", Pot, Drinker, now.AddDays(-9))
                            .AddBeerCrate("neu", Pot, Drinker, now.AddDays(-2))
                            .AddBeerCrate(
                                "zurueck",
                                Pot,
                                Drinker,
                                now.AddDays(-30),
                                undoneAt: now.AddDays(-30)
                            )
                            .AddBeerPayment("bar", Pot, Drinker, 1, now.AddDays(-10))
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Drinker, ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        var panel = Assert.Single(start.Panels, panel => panel.Kind == StartPanelKind.BeerTab);
        Assert.Equal(2, panel.ShownCount);
        Assert.Equal(
            [ctx.BeerList.Pots.IdOf("alter-topf"), ctx.BeerList.Pots.IdOf(Pot)],
            panel.BeerTabs!.Select(tab => tab.BeerPotId)
        );
        var old = panel.BeerTabs![0];
        Assert.Equal((false, 1, OldPrice), (old.PotIsOpen, old.OpenCrates, old.OpenCents));
        Assert.Equal(
            ("Otto", null, OldPaymentNote),
            (old.Owner?.FirstName, old.PaymentLink, old.PaymentNote)
        );
        var current = panel.BeerTabs![1];
        Assert.Equal(
            (true, 2, 2 * Price),
            (current.PotIsOpen, current.OpenCrates, current.OpenCents)
        );
        Assert.Equal(now.AddDays(-9), current.OldestOpenBookedAt);
        Assert.Equal(BeerListSeedBuilder.DefaultPaymentLink, current.PaymentLink);
        Assert.Equal(ctx.Identity.People.IdOf(Warden), current.Owner?.PersonId);
    }

    [Fact]
    public async Task Should_LeaveTheBeerTabOff_When_HerTabIsSettled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerCrates(Pot, Drinker, 2)
                            .AddBeerPayment("bar", Pot, Drinker, 2)
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Drinker, ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.BeerTab);
    }
}
