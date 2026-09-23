using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class GetClubHubAnnouncementsTests
{
    private const string Body = "Der Saal bleibt am Freitag geschlossen.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ExpiredBeforeTheSession = new(2026, 12, 31);
    private static readonly DateOnly ValidIntoTheSession = new(2027, 3, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInNovember = new(
        2026,
        11,
        11,
        11,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInDecember = new(
        2026,
        12,
        1,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInJanuary = new(
        2027,
        1,
        2,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetClubHubAnnouncementsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheNewestTwoAndCountThemAll_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var result = await ReadAsync(ctx, ct);

                Assert.Equal(
                    [
                        ctx.Club.Announcements.IdOf("januar"),
                        ctx.Club.Announcements.IdOf("dezember"),
                    ],
                    result.Announcements.Newest.Select(announcement => announcement.AnnouncementId)
                );
                Assert.Equal(3, result.Announcements.TotalCount);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveTheExpiredAnnouncementOff_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var result = await ReadAsync(ctx, ct);

                Assert.DoesNotContain(
                    result.Announcements.Newest,
                    announcement =>
                        announcement.AnnouncementId == ctx.Club.Announcements.IdOf("abgelaufen")
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTitelTextAutorAndGueltigBis_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var result = await ReadAsync(ctx, ct);
                var newest = result.Announcements.Newest[0];

                Assert.Equal("Januar", newest.Title);
                Assert.Equal(Body, newest.Body);
                Assert.Equal(PublishedInJanuary, newest.PublishedAt);
                Assert.Equal(ValidIntoTheSession, newest.ValidUntil);
                Assert.Equal(ctx.Identity.People.IdOf("alice"), newest.Author.PersonId);
                Assert.Equal("Alice", newest.Author.FirstName);
                Assert.Equal("Muster", newest.Author.LastName);
                Assert.Null(newest.Author.PortraitUrl);
                Assert.Null(newest.Author.OfficeName);
            }
        );
    }

    [Fact]
    public async Task Should_BreakTheTieOnTheYoungerAnnouncement_When_TwoWereHungUpAtTheSameMoment()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAtOneMomentAsync(ct);
                var result = await ReadAsync(ctx, ct);

                Assert.Equal(
                    [ctx.Club.Announcements.IdOf("zweiter"), ctx.Club.Announcements.IdOf("erster")],
                    result.Announcements.Newest.Select(announcement => announcement.AnnouncementId)
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheAnnouncementsEmpty_When_NobodyHasHungAnythingUp()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildAsync(_ => { }, ct);
                var result = await ReadAsync(ctx, ct);

                Assert.Empty(result.Announcements.Newest);
                Assert.Equal(0, result.Announcements.TotalCount);
            }
        );
    }

    private Task<SeededContext> BuildBoardAsync(CancellationToken ct) =>
        BuildAsync(
            club =>
                club.AddAnnouncement(
                        "abgelaufen",
                        "alice",
                        "Abgelaufen",
                        Body,
                        PublishedInNovember,
                        ExpiredBeforeTheSession
                    )
                    .AddAnnouncement("november", "alice", "November", Body, PublishedInNovember)
                    .AddAnnouncement("dezember", "alice", "Dezember", Body, PublishedInDecember)
                    .AddAnnouncement(
                        "januar",
                        "alice",
                        "Januar",
                        Body,
                        PublishedInJanuary,
                        ValidIntoTheSession
                    ),
            ct
        );

    private Task<SeededContext> BuildAtOneMomentAsync(CancellationToken ct) =>
        BuildAsync(
            club =>
                club.AddAnnouncement("erster", "alice", "Erster", Body, PublishedInJanuary)
                    .AddAnnouncement("zweiter", "alice", "Zweiter", Body, PublishedInJanuary),
            ct
        );

    private Task<SeededContext> BuildAsync(Action<ClubSeedBuilder> club, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club),
            ct
        );

    private static async Task<GetClubHubResponse> ReadAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetClubHub, GetClubHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
