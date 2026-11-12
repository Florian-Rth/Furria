using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementMentionSeeds;

namespace Furria.Api.Tests.Announcements;

public sealed class GetAnnouncementMentionablesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetAnnouncementMentionablesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferOnlyWhatTheWriterMaySee_When_SheLooksForSomethingToMention()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(MentionTargets(_fixture.TimeProvider.GetUtcNow()), ct);
        var client = await ctx.Identity.ClientForAsync(Author, ct);

        var (response, result) = await client.GETAsync<
            GetAnnouncementMentionables,
            GetAnnouncementMentionablesResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var offered = result.Mentionables;
        Assert.DoesNotContain(
            offered.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf(Unaffiliated)
        );
        Assert.Contains(
            offered.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf(Alice)
        );
        Assert.Equal(
            [ctx.Groups.Groups.IdOf(Garde)],
            offered.Groups.Select(group => group.GroupId)
        );
        Assert.Equal(
            [ctx.Club.CalendarEntries.IdOf(ClubMeeting)],
            offered.CalendarEntries.Select(entry => entry.CalendarEntryId)
        );
        Assert.Equal([ctx.Club.Events.IdOf(Session)], offered.Events.Select(row => row.EventId));
        Assert.Equal(
            [ctx.News.Posts.IdOf(Report)],
            offered.NewsPosts.Select(post => post.NewsPostId)
        );
        Assert.Equal(
            [ctx.Gallery.Albums.IdOf(Photos)],
            offered.Albums.Select(album => album.AlbumId)
        );
    }
}
