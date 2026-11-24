using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.BeerList;

public sealed class BeerStockWarningsTests : IClassFixture<ApiTestFixture>
{
    private const string SecondOperator = "otto";
    private const int CratesADay = 1;

    private static readonly TimeOnly Noon = new(12, 0);

    private readonly ApiTestFixture _fixture;

    public BeerStockWarningsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset NoonTomorrow => ClubClock.At(_fixture.Today.AddDays(1), Noon);

    [Fact]
    public async Task Should_WarnEveryOperatorOnce_When_TheBeerRunsOutWithinAWeek()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(cratesLeft: 7, ct);
        var wardensPhone = await SubscribedDeviceAsync(ctx, Warden, "stock-warden", ct);
        var operatorsPhone = await SubscribedDeviceAsync(ctx, SecondOperator, "stock-otto", ct);
        var drinkersPhone = await SubscribedDeviceAsync(ctx, Drinker, "stock-drinker", ct);

        await WarnAtAsync(now, ct);
        await WarnAtAsync(now + TimeSpan.FromHours(2), ct);
        await WarnAtAsync(now + TimeSpan.FromDays(3), ct);

        var push = Assert.Single(PushesAt(_fixture, wardensPhone));
        Assert.Equal("/beer-list/manage/stock", UrlOf(push));
        Assert.Single(PushesAt(_fixture, operatorsPhone));
        Assert.Empty(PushesAt(_fixture, drinkersPhone));
    }

    [Fact]
    public async Task Should_NotWarn_When_TheBeerLastsLongerThanAWeek()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(cratesLeft: 8, ct);
        var phone = await SubscribedDeviceAsync(ctx, Warden, "stock-plenty", ct);

        await WarnAtAsync(NoonTomorrow, ct);

        Assert.Empty(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_WaitForTheMorning_When_TheBeerRunsLowAtNight()
    {
        var ct = TestContext.Current.CancellationToken;
        var tomorrow = _fixture.Today.AddDays(1);
        var ctx = await BuildAsync(cratesLeft: 2, ct);
        var phone = await SubscribedDeviceAsync(ctx, Warden, "stock-night", ct);

        await WarnAtAsync(ClubClock.At(tomorrow, new TimeOnly(20, 0)), ct);
        await WarnAtAsync(ClubClock.At(tomorrow.AddDays(1), new TimeOnly(9, 59)), ct);
        Assert.Empty(PushesAt(_fixture, phone));

        await WarnAtAsync(ClubClock.At(tomorrow.AddDays(1), new TimeOnly(10, 0)), ct);
        Assert.Single(PushesAt(_fixture, phone));
    }

    [Fact]
    public async Task Should_WarnAgain_When_TheBeerRunsLowAgainAfterADelivery()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = NoonTomorrow;
        var ctx = await BuildAsync(cratesLeft: 2, ct);
        var phone = await SubscribedDeviceAsync(ctx, Warden, "stock-rearmed", ct);

        await WarnAtAsync(now, ct);
        await _fixture.AtInstantAsync(
            now + TimeSpan.FromHours(1),
            async () =>
            {
                var warden = await ctx.Identity.SignInAgainAsync(Warden, ct);
                var response = await warden.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
                    new()
                    {
                        BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                        BeerDrinkId = BeerListCast.BeerOf(ctx),
                        Crates = 3,
                    }
                );
                response.EnsureSuccessStatusCode();
            }
        );
        await WarnAtAsync(now + TimeSpan.FromHours(2), ct);

        Assert.Equal(2, PushesAt(_fixture, phone).Count);
    }

    [Fact]
    public async Task Should_WarnOnlyAboutTheNewlyLowDrink_When_AnotherWasWarnedBefore()
    {
        var ct = TestContext.Current.CancellationToken;
        var yesterday = NoonTomorrow.AddDays(-1);
        var taken = CratesADay * 21;
        var ctx = await _fixture.BuildAsync(
            builder =>
                Operators(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, openedAt: NoonTomorrow.AddDays(-100))
                            .AddBeerDrink(Pot, "Radler")
                            .AddBeerDelivery(Pot, taken + 2, yesterday.AddDays(-30))
                            .AddBeerDelivery(
                                Pot,
                                taken + 2,
                                yesterday.AddDays(-30),
                                drink: "Radler"
                            )
                            .AddBeerCrates(Pot, Drinker, taken, yesterday)
                            .AddBeerCrates(Pot, Drinker, taken, yesterday, drink: "Radler")
                    ),
            ct
        );
        var phone = await SubscribedDeviceAsync(ctx, Warden, "stock-one-new", ct);
        await WarnAtAsync(NoonTomorrow, ct);
        await _fixture.AtInstantAsync(
            NoonTomorrow + TimeSpan.FromMinutes(30),
            async () =>
            {
                var warden = await ctx.Identity.SignInAgainAsync(Warden, ct);
                var response = await warden.POSTAsync<PostBeerDelivery, PostBeerDeliveryRequest>(
                    new()
                    {
                        BeerPotId = ctx.BeerList.Pots.IdOf(Pot),
                        BeerDrinkId = ctx.BeerList.Drinks.IdOf("Radler"),
                        Crates = 1,
                    }
                );
                response.EnsureSuccessStatusCode();
            }
        );

        await WarnAtAsync(NoonTomorrow + TimeSpan.FromHours(1), ct);

        var pushes = PushesAt(_fixture, phone);
        Assert.Equal(2, pushes.Count);
        Assert.Equal("Radler wird knapp", TitleOf(pushes[1]));
        Assert.DoesNotContain("Bier", BodyOf(pushes[1]), StringComparison.Ordinal);
    }

    private static string TitleOf(JsonElement push) => push.GetProperty("title").GetString() ?? "";

    private static string BodyOf(JsonElement push) => push.GetProperty("body").GetString() ?? "";

    private Task WarnAtAsync(DateTimeOffset instant, CancellationToken ct) =>
        _fixture.AtInstantAsync(instant, () => _fixture.WarnOfBeerStockAsync(ct));

    private Task<SeededContext> BuildAsync(int cratesLeft, CancellationToken ct)
    {
        var yesterday = NoonTomorrow.AddDays(-1);
        var takenInPaceWindow = CratesADay * 21;

        return _fixture.BuildAsync(
            builder =>
                Operators(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, openedAt: NoonTomorrow.AddDays(-100))
                            .AddBeerDelivery(
                                Pot,
                                takenInPaceWindow + cratesLeft,
                                yesterday.AddDays(-30)
                            )
                            .AddBeerCrates(Pot, Drinker, takenInPaceWindow, yesterday)
                    ),
            ct
        );
    }

    private static SeedContextBuilder Operators(SeedContextBuilder builder) =>
        WardenAndDrinker(builder)
            .Identity(identity =>
                identity.AddPerson(SecondOperator, "Otto", "Ott").AddAccount(SecondOperator)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "schankhilfe",
                    "otto-schankhilfe",
                    "Schankhilfe",
                    SecondOperator,
                    FurriaPermissions.BeerListManage
                )
            );
}
