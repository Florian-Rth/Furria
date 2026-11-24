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
