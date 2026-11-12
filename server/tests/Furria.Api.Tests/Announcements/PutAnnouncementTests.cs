using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Text;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementMentionSeeds;

namespace Furria.Api.Tests.Announcements;

public sealed class PutAnnouncementTests : IClassFixture<ApiTestFixture>
{
    private const string Title = "Saalreinigung";
    private const string Body = "Am Samstag räumen wir gemeinsam den Saal auf.";
    private const string CorrectedTitle = "Saalreinigung fällt aus";
    private const string CorrectedBody = "Der Termin verschiebt sich auf die kommende Woche.";
    private const string HelperList = "Wer hilft beim Aufbau?";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ValidUntilInMarch = new(2021, 3, 1);
    private static readonly DateOnly AddOnValidUntil = new(2027, 1, 31);
    private static readonly DateTimeOffset AddOnNow = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);

    private static readonly DateTimeOffset PublishedInFebruary = new(
        2021,
        2,
        5,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutAnnouncementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CorrectTheAnnouncement_When_TheAuthorHoldsNoPermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToHaveTitle(CorrectedTitle)
            .Announcement(announcementId)
            .ToHaveBody(CorrectedBody)
            .Announcement(announcementId)
            .ToHaveValidUntil(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RewriteTheMentions_When_TheTextIsCorrected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                MentionTargets(_fixture.TimeProvider.GetUtcNow())(builder);
                builder.Club(club => club.AddAnnouncement("aushang", Author, Title, Body));
            },
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Author, ct);
        var announcementId = ctx.Club.Announcements.IdOf("aushang");
        var aliceId = ctx.Identity.People.IdOf(Alice);
        var gardeId = ctx.Groups.Groups.IdOf(Garde);
        var photosId = ctx.Gallery.Albums.IdOf(Photos);
        await CorrectBodyAsync(
            client,
            announcementId,
            $"@[Alice](person:{aliceId}) und @[Garde](group:{gardeId})"
        );

        var response = await CorrectBodyAsync(
            client,
            announcementId,
            $"Siehe @[Fotos](album:{photosId})."
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToHaveMentions((MentionKind.Album, photosId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheOldText_When_TheCorrectionLeavesTheSubset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await CorrectBodyAsync(client, announcementId, "> Ein Zitat");

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveBody(Body).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheDate_When_AnAnnouncementIsCorrected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = ValidUntilInMarch,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToHavePublishedAt(PublishedInFebruary)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CorrectAForeignAnnouncement_When_TheCallerHoldsThePermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveTitle(CorrectedTitle).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNeitherAutorNorBerechtigt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var announcementId = ctx.Club.Announcements.IdOf("von-alice");

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToHaveTitle(Title).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheAnnouncementIsAlreadyOffTheBoard()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = ctx.Club.Announcements.IdOf("von-alice") + 1,
                Title = CorrectedTitle,
                Body = CorrectedBody,
                ValidUntil = null,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTitelIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bea", ct);

        var response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = ctx.Club.Announcements.IdOf("von-alice"),
                Title = "",
                Body = CorrectedBody,
                ValidUntil = null,
                AddOns = [],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_DeleteTheAddOnsWithTheirAnswers_When_TheAuthorDropsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithAddOnsAsync(ct, attendanceClosedAt: null);
        var announcementId = ctx.Club.Announcements.IdOf("fest");

        var response = await CorrectAddOnsAsync(ctx, []);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToAskForAnswersAt(null, null)
            .Announcement(announcementId)
            .ToHaveAnswers()
            .Poll(ctx.Club.Polls.IdOf("snack"))
            .ToNotExist()
            .SignUpList(ctx.Club.SignUpLists.IdOf("helpers"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheAnswersInTheNewOrder_When_TheAuthorMovesTheAttendance()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithAddOnsAsync(ct, attendanceClosedAt: null);
        var announcementId = ctx.Club.Announcements.IdOf("fest");

        var response = await CorrectAddOnsAsync(
            ctx,
            [KeptSignUpList(ctx.Club.SignUpLists.IdOf("helpers")), Attendance(null)]
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Announcement(announcementId)
            .ToAskForAnswersAt(1, null)
            .Announcement(announcementId)
            .ToHaveAnswers((ctx.Identity.People.IdOf("chris"), AttendanceAnswer.Yes))
            .Announcement(announcementId)
            .ToHaveSignUpLists(HelperList)
            .Poll(ctx.Club.Polls.IdOf("snack"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseANewDeadline_When_TheAttendanceIsClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithAddOnsAsync(ct, attendanceClosedAt: AddOnNow.AddHours(-1));
        var announcementId = ctx.Club.Announcements.IdOf("fest");

        var response = await CorrectAddOnsAsync(ctx, [Attendance(AddOnNow.AddDays(2))]);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Announcement(announcementId).ToAskForAnswersAt(0, null).AssertAsync(ct);
    }

    private async Task<HttpResponseMessage> CorrectAddOnsAsync(
        SeededContext ctx,
        IReadOnlyList<PutAnnouncementAddOnDataDto> addOns
    )
    {
        HttpResponseMessage? response = null;
        await _fixture.AtInstantAsync(
            AddOnNow,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync("alice");
                response = await client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
                    new()
                    {
                        AnnouncementId = ctx.Club.Announcements.IdOf("fest"),
                        Title = Title,
                        Body = Body,
                        ValidUntil = AddOnValidUntil,
                        AddOns = addOns,
                    }
                );
            }
        );

        return response ?? throw new InvalidOperationException("No response.");
    }

    private static PutAnnouncementAddOnDataDto Attendance(DateTimeOffset? answersUntil) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Attendance,
            Attendance = new() { AnswersUntil = answersUntil },
            Poll = null,
            SignUpList = null,
        };

    private static PutAnnouncementAddOnDataDto KeptSignUpList(int signUpListId) =>
        new()
        {
            Kind = AnnouncementAddOnKind.SignUpList,
            Attendance = null,
            Poll = null,
            SignUpList = new()
            {
                SignUpListId = signUpListId,
                Title = HelperList,
                Hint = null,
                SignUpUntil = null,
            },
        };

    private Task<SeededContext> BuildWithAddOnsAsync(
        CancellationToken ct,
        DateTimeOffset? attendanceClosedAt
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Leser")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddAnnouncement(
                                "fest",
                                "alice",
                                Title,
                                Body,
                                AddOnNow.AddDays(-2),
                                AddOnValidUntil,
                                new AnnouncementAttendanceIntent(
                                    Position: 0,
                                    ClosedAt: attendanceClosedAt
                                )
                            )
                            .AddAnnouncementResponse(
                                "chris-fest",
                                "fest",
                                "chris",
                                AttendanceAnswer.Yes
                            )
                            .AddAnnouncementPoll(
                                "snack",
                                "fest",
                                "Was bringst du mit?",
                                ["Kuchen", "Obst"],
                                position: 1
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddAnnouncementSignUpList("helpers", "fest", HelperList, position: 2)
                            .AddCalendarSignUpLine("chris-helps", "helpers", "chris", "Bänke")
                    ),
            ct
        );

    private static Task<HttpResponseMessage> CorrectBodyAsync(
        HttpClient client,
        int announcementId,
        string body
    ) =>
        client.PUTAsync<PutAnnouncement, PutAnnouncementRequest>(
            new()
            {
                AnnouncementId = announcementId,
                Title = CorrectedTitle,
                Body = body,
                ValidUntil = null,
                AddOns = [],
            }
        );

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
                            .AddPerson("chris", "Chris", "Leser")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aushangwart",
                            "bea-aushangwart",
                            "Aushangwart",
                            "bea",
                            FurriaPermissions.AnnouncementsPost
                        )
                    )
                    .Club(club =>
                        club.AddAnnouncement(
                            "von-alice",
                            "alice",
                            Title,
                            Body,
                            PublishedInFebruary,
                            ValidUntilInMarch
                        )
                    ),
            ct
        );
}
