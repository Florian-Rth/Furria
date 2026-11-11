using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class CloseCalendarPollTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset AtTheCoffee = new(2027, 1, 20, 15, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset LastWeek = new(2027, 1, 8, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public CloseCalendarPollTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseThePoll_When_TheCallerMayEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await CloseAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarPoll(pollId)
            .ToBeClosedAt(Now, ctx.Identity.People.IdOf("ilka"))
            .CalendarPoll(pollId)
            .ToHaveVoteCount(1)
            .AssertAsync(ct);
    }

    public static TheoryData<string, DateTimeOffset> PollsClosedByTime =>
        new() { { "drinks", LastWeek }, { "sausages", LastWeek.AddDays(1) } };

    [Theory]
    [MemberData(nameof(PollsClosedByTime))]
    public async Task Should_StampTheMomentItClosedWithoutACloser_When_ThePollHadClosedByTime(
        string pollAlias,
        DateTimeOffset closedAt
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf(pollAlias);

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await CloseAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarPoll(pollId).ToBeClosedAt(closedAt, null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayNotEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        var response = await CloseAsync(ctx, "chris", pollId, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.CalendarPoll(pollId).ToBeClosedByHand(false).AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> CloseAsync(
        SeededContext ctx,
        string callerAlias,
        int pollId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(callerAlias, ct);

        return await client.POSTAsync<CloseCalendarPoll, CloseCalendarPollRequest>(
            new CloseCalendarPollRequest { PollId = pollId }
        );
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Trainer")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Club(club =>
                        club.AddCalendarEntry("coffee", "Kaffeekränzchen", AtTheCoffee)
                            .AddCalendarPoll(
                                "snack",
                                "coffee",
                                "Was bringst du mit?",
                                ["Kuchen", "Obst"]
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddCalendarPoll(
                                "drinks",
                                "coffee",
                                "Was trinkst du?",
                                ["Kaffee", "Tee"],
                                votesUntil: LastWeek,
                                position: 1
                            )
                            .AddCalendarEntry("brunch", "Brunch", LastWeek.AddDays(1))
                            .AddCalendarPoll(
                                "sausages",
                                "brunch",
                                "Wie viele Würste?",
                                ["Eine", "Zwei"]
                            )
                    ),
            ct
        );
}
