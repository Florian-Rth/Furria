using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class PutCalendarPollVotesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheCoffee = new(2027, 1, 20, 15, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheBreakfast = new(
        2027,
        1,
        10,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset LastWeek = new(2027, 1, 8, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PutCalendarPollVotesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheVote_When_SheVotesAgainOnASingleChoicePoll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "chris", pollId, ["snack:Obst"], ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarPoll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("chris"), "Obst")
            .CalendarPoll(pollId)
            .ToHaveVoteCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordEveryChoice_When_ThePollAllowsSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("days");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(
                    ctx,
                    "dana",
                    pollId,
                    ["days:Montag", "days:Mittwoch"],
                    ct
                );

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarPoll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("dana"), "Montag", "Mittwoch")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WithdrawTheVotes_When_SheChoosesNothing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "chris", pollId, [], ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarPoll(pollId).ToHaveVoteCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseSeveralChoices_When_ThePollAllowsOnlyOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(
                    ctx,
                    "dana",
                    pollId,
                    ["snack:Kuchen", "snack:Obst"],
                    ct
                );

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarPoll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("dana"))
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("closed", "closed:Ja")]
    [InlineData("deadline", "deadline:Ja")]
    [InlineData("late", "late:Ja")]
    public async Task Should_RefuseTheVote_When_ThePollHasClosed(string pollAlias, string option)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf(pollAlias);

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "dana", pollId, [option], ct);

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarPoll(pollId).ToHaveVoteCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheVote_When_TheOptionBelongsToAnotherPoll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("snack");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "dana", pollId, ["days:Montag"], ct);

                Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_SheDoesNotSeeTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("secret");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "dana", pollId, ["secret:Ja"], ct);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );

        await ctx.Expected.CalendarPoll(pollId).ToHaveVoteCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheVote_When_SheIsChosenForTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var pollId = ctx.Club.CalendarPolls.IdOf("secret");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var response = await VoteAsync(ctx, "chris", pollId, ["secret:Ja"], ct);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            }
        );

        await ctx
            .Expected.CalendarPoll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("chris"), "Ja")
            .AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> VoteAsync(
        SeededContext ctx,
        string voterAlias,
        int pollId,
        IReadOnlyList<string> optionAliases,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(voterAlias, ct);

        return await client.PUTAsync<PutCalendarPollVotes, PutCalendarPollVotesRequest>(
            new PutCalendarPollVotesRequest
            {
                PollId = pollId,
                OptionIds = [.. optionAliases.Select(ctx.Club.CalendarPollOptions.IdOf)],
            }
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
                            .AddPerson("dana", "Dana", "Doppelt")
                            .AddAccount("dana")
                            .AddMembership("dana-first", "dana", JoinedIn2017)
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
                            .AddCalendarEntry("breakfast", "Frühschoppen", AtTheBreakfast)
                            .AddCalendarEntry(
                                "farewell",
                                "Abschied planen",
                                AtTheCoffee,
                                audiencePersonAliases: ["chris", "ilka"]
                            )
                            .AddCalendarPoll(
                                "snack",
                                "coffee",
                                "Was bringst du mit?",
                                ["Kuchen", "Brezeln", "Obst"]
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddCalendarPoll(
                                "days",
                                "coffee",
                                "Wann hast du Zeit?",
                                ["Montag", "Dienstag", "Mittwoch"],
                                allowsMultipleChoices: true
                            )
                            .AddCalendarPoll(
                                "closed",
                                "coffee",
                                "Kommst du?",
                                ["Ja", "Nein"],
                                closedAt: LastWeek
                            )
                            .AddCalendarPoll(
                                "deadline",
                                "coffee",
                                "Kaffee oder Tee?",
                                ["Ja", "Nein"],
                                votesUntil: LastWeek
                            )
                            .AddCalendarPoll("late", "breakfast", "Weißwurst?", ["Ja", "Nein"])
                            .AddCalendarPoll("secret", "farewell", "Geschenk?", ["Ja", "Nein"])
                    ),
            ct
        );
}
