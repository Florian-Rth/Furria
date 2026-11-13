using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Api.Endpoints.Calendar;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class PutAnnouncementPollVotesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutAnnouncementPollVotesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordTheVote_When_ARunningMemberVotes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var pollId = ctx.Club.Polls.IdOf("snack");

        var response = await VoteAtAsync(Now, ctx, "mara", "Obst", ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Poll(pollId)
            .ToHaveVotesOf(ctx.Identity.People.IdOf("mara"), "Obst")
            .Poll(pollId)
            .ToHaveVoteCount(2)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("paula")]
    [InlineData("rolf")]
    public async Task Should_ReturnForbidden_When_TheReaderHoldsNoRunningUnpausedMembership(
        string readerAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await VoteAtAsync(Now, ctx, readerAlias, "Obst", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Poll(ctx.Club.Polls.IdOf("snack")).ToHaveVoteCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheVote_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);

        var response = await VoteAtAsync(AfterTheLastDay, ctx, "mara", "Obst", ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_StayOpen_When_TheAnnouncementHasNoLastDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            _fixture,
            ct,
            club =>
                club.AddAnnouncement("offen", "alice", "Offen", "Ohne Ende.", Now.AddDays(-1))
                    .AddAnnouncementPoll("lange", "offen", "Wohin?", ["Hier", "Dort"])
        );

        var response = await VoteAtAsync(
            AfterTheLastDay.AddYears(1),
            ctx,
            "mara",
            "Dort",
            ct,
            "lange"
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheCalendarRouteIsGivenAnAnnouncementPoll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(_fixture, ct);
        var pollId = ctx.Club.Polls.IdOf("snack");

        var response = await AtNowAsync(
            _fixture,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync("mara", ct);
                return await client.PUTAsync<PutCalendarPollVotes, PutCalendarPollVotesRequest>(
                    new() { PollId = pollId, OptionIds = [await OptionIdAsync(ctx, "Obst", ct)] }
                );
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<HttpResponseMessage> VoteAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        string optionLabel,
        CancellationToken ct,
        string pollAlias = "snack"
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.PUTAsync<
                    PutAnnouncementPollVotes,
                    PutAnnouncementPollVotesRequest
                >(
                    new()
                    {
                        PollId = ctx.Club.Polls.IdOf(pollAlias),
                        OptionIds = [await OptionIdAsync(ctx, optionLabel, ct, pollAlias)],
                    }
                );
            }
        );

    private async Task<int> OptionIdAsync(
        SeededContext ctx,
        string label,
        CancellationToken ct,
        string pollAlias = "snack"
    )
    {
        var read = await ReadAtAsync(_fixture, ctx, "ilka", Now, ct);
        return read
            .Announcements.SelectMany(announcement => announcement.AddOns)
            .Select(addOn => addOn.Poll)
            .OfType<CalendarPollDto>()
            .Single(poll => poll.PollId == ctx.Club.Polls.IdOf(pollAlias))
            .Options.Single(option => option.Label == label)
            .OptionId;
    }
}
