using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Core.Text;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementMentionSeeds;
using AnnouncementAddOnKind = Furria.Core.Club.AnnouncementAddOnKind;
using AttendanceAnswer = Furria.Core.Club.AttendanceAnswer;

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
                        AddOns = [],
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
                AddOns = [],
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
                AddOns = [],
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
                AddOns = [],
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
                AddOns = [],
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
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_AttachTheAddOnsInTheirOrder_When_ThePosterAddsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var answersUntil = InsideTheSession.AddDays(3);
        PostAnnouncementResponse? posted = null;

        var ctx = await BuildBoardAsync(ct);
        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
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
                        AddOns =
                        [
                            PollAddOn("Wer bringt Eimer?"),
                            AttendanceAddOn(answersUntil),
                            SignUpListAddOn("Wer putzt was?"),
                        ],
                    }
                );
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                posted = result;
            }
        );

        var announcementId = posted?.AnnouncementId ?? 0;
        await ctx
            .Expected.Announcement(announcementId)
            .ToAskForAnswersAt(1, answersUntil)
            .Announcement(announcementId)
            .ToHavePolls("Wer bringt Eimer?")
            .Announcement(announcementId)
            .ToHaveSignUpLists("Wer putzt was?")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheAnnouncementAsksForAnswersTwice()
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
                Body = Body,
                ValidUntil = null,
                AddOns = [AttendanceAddOn(null), AttendanceAddOn(null)],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static PostAnnouncementAddOnDataDto AttendanceAddOn(DateTimeOffset? answersUntil) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Attendance,
            Attendance = new() { AnswersUntil = answersUntil },
            Poll = null,
            SignUpList = null,
            Borrowed = null,
        };

    private static PostAnnouncementAddOnDataDto PollAddOn(string question) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Poll,
            Attendance = null,
            Poll = new()
            {
                PollId = null,
                Question = question,
                AllowsMultipleChoices = false,
                IsAnonymous = false,
                VotesUntil = null,
                Options =
                [
                    new() { OptionId = null, Label = "Ich" },
                    new() { OptionId = null, Label = "Nicht ich" },
                ],
            },
            SignUpList = null,
            Borrowed = null,
        };

    private static PostAnnouncementAddOnDataDto SignUpListAddOn(string title) =>
        new()
        {
            Kind = AnnouncementAddOnKind.SignUpList,
            Attendance = null,
            Poll = null,
            SignUpList = new()
            {
                SignUpListId = null,
                Title = title,
                Hint = null,
                SignUpUntil = null,
            },
            Borrowed = null,
        };

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
