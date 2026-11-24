using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementAddOnClub;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class CloseAnnouncementPollTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public CloseAnnouncementPollTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
                var client = await ctx.Identity.SignInAgainAsync("ilka", ct);
                return await client.POSTAsync<CloseCalendarPoll, CloseCalendarPollRequest>(
                    new() { PollId = pollId }
                );
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.Poll(pollId).ToBeClosedByHand(false).AssertAsync(ct);
    }
}
