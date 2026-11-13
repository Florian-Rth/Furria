using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class ReopenCalendarPollTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset AtTheCoffee = new(2027, 1, 20, 15, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public ReopenCalendarPollTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReopenThePollKeepingItsVotes_When_AnEditorReopensIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await ReopenAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.Poll(pollId)
            .ToBeClosedByHand(false)
            .Poll(pollId)
            .ToHaveVotesUntil(Now.AddDays(1))
            .Poll(pollId)
            .ToHaveVoteCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropThePassedDeadline_When_ThePollClosedByItsDeadline()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("drinks");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await ReopenAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.Poll(pollId)
            .ToBeClosedByHand(false)
            .Poll(pollId)
            .ToHaveVotesUntil(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropTheDeadline_When_ItPassesAtThisVeryMoment()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("cutoff");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await ReopenAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx.Expected.Poll(pollId).ToHaveVotesUntil(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseReopening_When_TheEntryHasStarted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("snack");

        await _fixture.AtInstantAsync(
            AtTheCoffee,
            async () =>
            {
                var response = await ReopenAsync(ctx, "ilka", pollId, ct);

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );

        await ctx.Expected.Poll(pollId).ToBeClosedByHand(true).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayNotEditTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await ReopenAsync(ctx, "chris", pollId, ct);

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );

        await ctx.Expected.Poll(pollId).ToBeClosedByHand(true).AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> ReopenAsync(
        SeededContext ctx,
        string callerAlias,
        int pollId,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(callerAlias, ct);

        return await client.POSTAsync<ReopenCalendarPoll, ReopenCalendarPollRequest>(
            new ReopenCalendarPollRequest { PollId = pollId }
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
                                ["Kuchen", "Obst"],
                                votesUntil: Now.AddDays(1),
                                closedAt: Now.AddDays(-1),
                                closedByAlias: "ilka"
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddCalendarPoll(
                                "drinks",
                                "coffee",
                                "Was trinkst du?",
                                ["Kaffee", "Tee"],
                                votesUntil: Now.AddDays(-1),
                                position: 1
                            )
                            .AddCalendarPoll(
                                "cutoff",
                                "coffee",
                                "Wer kommt?",
                                ["Ich", "Niemand"],
                                votesUntil: Now,
                                position: 2
                            )
                    ),
            ct
        );
}
