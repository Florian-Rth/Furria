using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class ReopenAnnouncementPollTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ReopenAnnouncementPollTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReopenThePoll_When_ThePosterReopensItBeforeTheLastDayEnds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClosedAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("zu");

        var response = await ReopenAtAsync(Now, ctx, "ilka", pollId, ct);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Poll(pollId).ToBeClosedByHand(false).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseReopening_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClosedAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("zu");

        var response = await ReopenAtAsync(AfterTheLastDay, ctx, "ilka", pollId, ct);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Poll(pollId).ToBeClosedByHand(true).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerNeitherWroteNorMayPostAnnouncements()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClosedAsync(ct);
        var pollId = ctx.Club.Polls.IdOf("zu");

        var response = await ReopenAtAsync(Now, ctx, "chris", pollId, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private Task<SeededContext> BuildClosedAsync(CancellationToken ct) =>
        BuildAsync(
            _fixture,
            ct,
            club =>
                club.AddAnnouncementPoll(
                    "zu",
                    "fest",
                    "Welcher Tag?",
                    ["Samstag", "Sonntag"],
                    closedAt: Now.AddHours(-2),
                    position: 3
                )
        );

    private Task<HttpResponseMessage> ReopenAtAsync(
        DateTimeOffset instant,
        SeededContext ctx,
        string callerAlias,
        int pollId,
        CancellationToken ct
    ) =>
        AtAsync(
            _fixture,
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(callerAlias, ct);
                return await client.POSTAsync<
                    ReopenAnnouncementPoll,
                    ReopenAnnouncementPollRequest
                >(new() { PollId = pollId });
            }
        );
}
