using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Core.Text;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementMentionSeeds;

namespace Furria.Api.Tests.Announcements;

public sealed class PostAnnouncementTests : IClassFixture<ApiTestFixture>
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ValidUntilInMarch = new(2027, 3, 1);

    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_HangTheAnnouncementUp_When_ThePermittedPersonWritesIt()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                var ctx = await BuildBoardAsync(ct);
                var client = await ctx.Identity.ClientForAsync("bea", ct);

                var (response, result) = await client.POSTAsync<
                    PostAnnouncement,
                    PostAnnouncementRequest,
                    PostAnnouncementResponse
                >(
                    new()
                    {
                        Title = Title,
                        Body = Body,
                        ValidUntil = ValidUntilInMarch,
                    }
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx
                    .Expected.Announcement(result.AnnouncementId)
                    .ToHaveTitle(Title)
                    .Announcement(result.AnnouncementId)
                    .ToHaveBody(Body)
                    .Announcement(result.AnnouncementId)
                    .ToHaveValidUntil(ValidUntilInMarch)
                    .Announcement(result.AnnouncementId)
                    .ToHaveAuthor(ctx.Identity.People.IdOf("bea"))
                    .Announcement(result.AnnouncementId)
                    .ToHavePublishedAt(InsideTheSession)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_HangAnOpenEndedAnnouncementUp_When_NoValidUntilIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = Body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Announcement(result.AnnouncementId)
            .ToHaveValidUntil(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTitelIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = "",
                Body = Body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTextIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = "",
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_RecordEveryKindOfMention_When_TheTextMentionsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(MentionTargets(_fixture.TimeProvider.GetUtcNow()), ct);
        var client = await ctx.Identity.ClientForAsync(Author, ct);
        var aliceId = ctx.Identity.People.IdOf(Alice);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var entryId = ctx.Club.CalendarEntries.IdOf(ClubMeeting);
        var eventId = ctx.Club.Events.IdOf(Session);
        var reportId = ctx.News.Posts.IdOf(Report);
        var photosId = ctx.Gallery.Albums.IdOf(Photos);

        var (response, result) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body =
                    $"@[Alice](person:{aliceId}) und @[Garde](group:{gardeId})"
                    + $" zum @[Treffen](calendar-entry:{entryId}) und zur @[Sitzung](event:{eventId}),"
                    + $" siehe @[Bericht](news-post:{reportId}), @[Fotos](album:{photosId})"
                    + $" und nochmals @[Alice](person:{aliceId}).",
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Announcement(result.AnnouncementId)
            .ToHaveMentions(
                (MentionKind.Person, aliceId),
                (MentionKind.Group, gardeId),
                (MentionKind.CalendarEntry, entryId),
                (MentionKind.Event, eventId),
                (MentionKind.NewsPost, reportId),
                (MentionKind.Album, photosId)
            )
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("### Zu tief")]
    [InlineData("Ein *kursives* Wort")]
    [InlineData("@[Nirgends](venue:1)")]
    [InlineData("[Link](ftp://saal.de)")]
    public async Task Should_RefuseTheText_When_ItLeavesTheSubset(string body)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = Title,
                Body = body,
                ValidUntil = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private Task<SeededContext> BuildBoardAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Aushang")
                            .AddAccount("bea")
                            .AddMembership("bea-first", "bea", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aushangwart",
                            "bea-aushangwart",
                            "Aushangwart",
                            "bea",
                            FurriaPermissions.AnnouncementsPost
                        )
                    ),
            ct
        );
}
