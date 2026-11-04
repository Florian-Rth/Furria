using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.BeerList;

public sealed class PostMyBeerCratesTests : IClassFixture<ApiTestFixture>
{
    private const int CratePrice = 14_50;
    private const string SecondDrinker = "jonas";

    private readonly ApiTestFixture _fixture;

    public PostMyBeerCratesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BookTheCratesOnHerTabAtTheCurrentPrice_When_AnEnrolledMemberConfirms()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, CratePrice)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var (response, result) = await client.POSTAsync<
            PostMyBeerCrates,
            PostMyBeerCratesRequest,
            PostMyBeerCratesResponse
        >(new() { Count = 2 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.CrateIds.Count);
        Assert.Equal(now + BeerCrate.UndoWindow, result.UndoableUntil);
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var miraId = ctx.Identity.People.IdOf(Drinker);
        await ctx
            .Expected.BeerTabOf(miraId)
            .ToHaveTakenCrates(2)
            .BeerTabOf(miraId)
            .ToEndWithCratesOf(2, potId, CratePrice, miraId, now)
            .BeerStockOfPot(potId)
            .ToStandAt(8)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheBooking_When_TheStockHoldsFewerCrates()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 3)
                            .AddBeerCrates(Pot, Warden, 2)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(
            new() { Count = 2 }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(0)
            .BeerStockOfPot(ctx.BeerList.Pots.IdOf(Pot))
            .ToStandAt(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseMoreThanThreeCrates_When_AMemberBooksForHerself()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 10)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(
            new() { Count = BeerCrate.MaxPerOwnBooking + 1 }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_NoPotIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(
                                "alter-topf",
                                Warden,
                                openedAt: now.AddDays(-200),
                                closedAt: now.AddDays(-2)
                            )
                            .AddBeerDelivery("alter-topf", 10, now.AddDays(-100))
                            .AddBeerListEnrollment("mira-bier", Drinker)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync(Drinker, ct);
        var response = await client.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(
            new() { Count = 1 }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerTabOf(ctx.Identity.People.IdOf(Drinker))
            .ToHaveTakenCrates(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BookOnlyOneOfTwoRacingBookings_When_OneCrateIsLeft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity
                            .AddAccount(SecondDrinker)
                            .AddMembership("jonas-first", SecondDrinker)
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden)
                            .AddBeerDelivery(Pot, 1)
                            .AddBeerListEnrollment("mira-bier", Drinker)
                            .AddBeerListEnrollment("jonas-bier", SecondDrinker)
                    ),
            ct
        );
        var potId = ctx.BeerList.Pots.IdOf(Pot);
        var mira = await ctx.Identity.ClientForAsync(Drinker, ct);
        var jonas = await ctx.Identity.ClientForAsync(SecondDrinker, ct);

        var responses = await WhileThePotIsLockedAsync(
            potId,
            waitingBookings: 2,
            () =>
                Task.WhenAll(
                    mira.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(new() { Count = 1 }),
                    jonas.POSTAsync<PostMyBeerCrates, PostMyBeerCratesRequest>(new() { Count = 1 })
                ),
            ct
        );

        Assert.Equal(
            [HttpStatusCode.OK, HttpStatusCode.Conflict],
            responses.Select(response => response.StatusCode).Order()
        );
        await ctx.Expected.BeerStockOfPot(potId).ToStandAt(0).AssertAsync(ct);
    }

    private async Task<T> WhileThePotIsLockedAsync<T>(
        int beerPotId,
        int waitingBookings,
        Func<Task<T>> book,
        CancellationToken ct
    )
    {
        await using var scope = _fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Task<T> booking;
        await using (var transaction = await dbContext.Database.BeginTransactionAsync(ct))
        {
            await dbContext
                .Database.SqlQuery<int>(
                    $"SELECT id AS \"Value\" FROM beer_pot WHERE id = {beerPotId} FOR UPDATE"
                )
                .ToListAsync(ct);
            booking = book();
            await Polling.UntilAsync(
                async probeCt =>
                    await BlockedSessionsAsync(probeCt) >= waitingBookings ? "blocked" : null,
                TimeSpan.FromSeconds(10),
                "The bookings never queued behind the pot lock",
                ct
            );
            await transaction.CommitAsync(ct);
        }

        return await booking;
    }

    private async Task<int> BlockedSessionsAsync(CancellationToken ct)
    {
        await using var scope = _fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await dbContext
            .Database.SqlQuery<int>(
                $"""
                SELECT count(DISTINCT locks.pid)::int AS "Value"
                FROM pg_locks locks
                JOIN pg_stat_activity activity ON activity.pid = locks.pid
                WHERE NOT locks.granted AND activity.datname = current_database()
                """
            )
            .SingleAsync(ct);
    }
}
