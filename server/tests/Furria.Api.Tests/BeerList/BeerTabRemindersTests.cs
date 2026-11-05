using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;
using static Furria.Api.Tests.BeerList.BeerListDevices;

namespace Furria.Api.Tests.BeerList;

public sealed class BeerTabRemindersTests : IClassFixture<ApiTestFixture>
{
    private const string OldPot = "alter-topf";

    private static readonly TimeOnly Noon = new(12, 0);
    private static readonly TimeSpan Week = TimeSpan.FromDays(7);

    private readonly ApiTestFixture _fixture;

    public BeerTabRemindersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset NoonTomorrow => ClubClock.At(_fixture.Today.AddDays(1), Noon);

    [Fact]
    public async Task Should_RemindOnlyTheHolderToPay_When_HerOldestOpenCrateIsAWeekOld()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerCrates(Pot, Drinker, 2, now - Week),
            ct
        );
        var drinkersPhone = await SubscribedDeviceAsync(ctx, Drinker, "tab-week-old", ct);
        var wardensPhone = await SubscribedDeviceAsync(ctx, Warden, "tab-week-old-warden", ct);

        await RemindAtAsync(now, ct);

        var push = Assert.Single(PushesAt(_fixture, drinkersPhone));
        Assert.Equal("/beer-list", UrlOf(push));
        Assert.Empty(PushesAt(_fixture, wardensPhone));
    }

    [Fact]
    public async Task Should_NotRemind_When_TheOldestOpenCrateIsYoungerThanAWeek()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList =>
                beerList.AddBeerCrates(Pot, Drinker, 3, now - Week + TimeSpan.FromMinutes(1)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-young", ct);

        await RemindAtAsync(now, ct);

        Assert.Empty(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_RemindAgainEveryWeek_When_TheTabStaysOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerCrates(Pot, Drinker, 1, now - TimeSpan.FromDays(10)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-weekly", ct);

        await RemindAtAsync(now, ct);
        await RemindAtAsync(now + TimeSpan.FromHours(3), ct);
        await RemindAtAsync(now + Week - TimeSpan.FromMinutes(1), ct);
        Assert.Single(PushesAt(_fixture, phone));

        await RemindAtAsync(now + Week, ct);
        Assert.Equal(2, PushesAt(_fixture, phone).Count);
    }

    [Fact]
    public async Task Should_RemindAsSoonAsTheHolderTurnsNotificationsOn_When_NoDeviceGotTheDueReminder()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList => beerList.AddBeerCrates(Pot, Drinker, 1, now - TimeSpan.FromDays(10)),
            ct
        );

        await RemindAtAsync(now, ct);
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-late-device", ct);
        await RemindAtAsync(now + TimeSpan.FromMinutes(15), ct);

        Assert.Single(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_WaitForTheMorning_When_TheReminderFallsDueOutsideTheDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var tomorrow = _fixture.Today.AddDays(1);
        var ctx = await BuildAsync(
            beerList =>
                beerList.AddBeerCrates(Pot, Drinker, 1, NoonTomorrow - TimeSpan.FromDays(10)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-quiet-hours", ct);

        await RemindAtAsync(ClubClock.At(tomorrow, new TimeOnly(20, 0)), ct);
        await RemindAtAsync(ClubClock.At(tomorrow.AddDays(1), new TimeOnly(3, 0)), ct);
        await RemindAtAsync(ClubClock.At(tomorrow.AddDays(1), new TimeOnly(9, 59)), ct);
        Assert.Empty(PushesAt(_fixture, phone));

        await RemindAtAsync(ClubClock.At(tomorrow.AddDays(1), new TimeOnly(10, 0)), ct);
        Assert.Single(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_WaitAFullWeekForTheNewCrate_When_APaymentSettledTheTabSinceTheLastReminder()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerCrate("bezahlt", Pot, Drinker, now - TimeSpan.FromDays(20))
                    .AddBeerPayment("bar", Pot, Drinker, 1)
                    .AddBeerTabReminder(Drinker, now - TimeSpan.FromDays(2))
                    .AddBeerCrate("neu", Pot, Drinker, now - TimeSpan.FromDays(1)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-settled", ct);

        await RemindAtAsync(now + TimeSpan.FromDays(5), ct);
        Assert.Empty(PushesAt(_fixture, phone));

        await RemindAtAsync(now + TimeSpan.FromDays(6), ct);
        Assert.Single(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_KeepTheWeeklyRhythm_When_APaymentLeftOlderCratesOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerCrate("bezahlt", Pot, Drinker, now - TimeSpan.FromDays(20))
                    .AddBeerPayment("bar", Pot, Drinker, 1)
                    .AddBeerCrate("offen", Pot, Drinker, now - TimeSpan.FromDays(15))
                    .AddBeerTabReminder(Drinker, now - TimeSpan.FromDays(6)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-partly-paid", ct);

        await RemindAtAsync(now, ct);
        Assert.Empty(PushesAt(_fixture, phone));

        await RemindAtAsync(now + TimeSpan.FromDays(1), ct);
        Assert.Single(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_NotRemind_When_EveryOldCrateIsPaidOrUndone()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var longAgo = now - TimeSpan.FromDays(20);
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerCrate("bezahlt", Pot, Drinker, longAgo)
                    .AddBeerPayment("bar", Pot, Drinker, 1)
                    .AddBeerCrate("rueckgaengig", Pot, Drinker, longAgo, undoneAt: longAgo),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-settled-long-ago", ct);

        await RemindAtAsync(now, ct);

        Assert.Empty(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_RemindOfCratesStillOwedFromAHandedOverPot_When_TheyAreAWeekOld()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(
            beerList =>
                beerList
                    .AddBeerPot(
                        OldPot,
                        Warden,
                        openedAt: now - TimeSpan.FromDays(200),
                        closedAt: now - TimeSpan.FromDays(40)
                    )
                    .AddBeerCrates(OldPot, Drinker, 1, now - TimeSpan.FromDays(50)),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Drinker, "tab-old-pot", ct);

        await RemindAtAsync(now, ct);

        Assert.Equal("/beer-list", UrlOf(Assert.Single(PushesAt(_fixture, phone))));
    }

    private Task RemindAtAsync(DateTimeOffset instant, CancellationToken ct) =>
        _fixture.AtInstantAsync(instant, () => _fixture.RemindOfBeerTabsAsync(ct));

    private Task<SeededContext> BuildAsync(
        Action<BeerListSeedBuilder> crates,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                    {
                        beerList.AddBeerPot(Pot, Warden, openedAt: NoonTomorrow.AddDays(-100));
                        crates(beerList);
                    }),
            ct
        );
}
