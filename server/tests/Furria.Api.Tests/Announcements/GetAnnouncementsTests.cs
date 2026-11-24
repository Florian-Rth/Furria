using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Announcements.AnnouncementMentionSeeds;

namespace Furria.Api.Tests.Announcements;

[SeedsAliases]
public sealed class GetAnnouncementsTests : IClassFixture<ApiTestFixture>
{
    private const string Body = "Der Saal bleibt am Freitag geschlossen.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ExpiredIn2021 = new(2021, 1, 31);

    private static readonly DateTimeOffset PublishedInJanuary = new(
        2021,
        1,
        5,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInFebruary = new(
        2021,
        2,
        5,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PublishedInMarch = new(
        2021,
        3,
        5,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetAnnouncementsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferEditingHerOwnAnnouncementOnly_When_TheAuthorHoldsNoPermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var result = await ReadAsync(ctx, "alice", ct);

        Assert.True(EditableIn(result, ctx.Club.Announcements.IdOf("mittel")));
        Assert.False(EditableIn(result, ctx.Club.Announcements.IdOf("von-bea")));
    }

    [Fact]
    public async Task Should_ResolveOnlyTheMentionsTheReaderMaySee_When_TheTextMentionsEveryKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(MentionTargets(_fixture.TimeProvider.GetUtcNow()), ct);
        await PostAsync(ctx, BodyMentioningEverything(ctx), ct);

        var mentions = Assert.Single((await ReadAsync(ctx, Reader, ct)).Announcements).Mentions;

        Assert.Equal(
            [ctx.Identity.People.IdOf(Alice)],
            mentions.Persons.Select(person => person.PersonId)
        );
        Assert.Equal(
            [ctx.Groups.Groups.IdOf(Garde)],
            mentions.Groups.Select(group => group.GroupId)
        );
        Assert.Equal(
            [ctx.Club.CalendarEntries.IdOf(ClubMeeting)],
            mentions.CalendarEntries.Select(entry => entry.CalendarEntryId)
        );
        Assert.Equal([ctx.Club.Events.IdOf(Session)], mentions.Events.Select(row => row.EventId));
        Assert.Equal(
            [ctx.News.Posts.IdOf(Report)],
            mentions.NewsPosts.Select(post => post.NewsPostId)
        );
        Assert.Equal(
            [ctx.Gallery.Albums.IdOf(Photos)],
            mentions.Albums.Select(album => album.AlbumId)
        );
    }

    [Fact]
    public async Task Should_NameWhoHasNotAnswered_When_TheReaderWroteTheAnnouncement()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await AnnouncementAddOnClub.BuildAsync(_fixture, ct);

        var read = await AnnouncementAddOnClub.ReadAtAsync(
            _fixture,
            ctx,
            "alice",
            AnnouncementAddOnClub.Now,
            ct
        );

        var fest = Assert.Single(read.Announcements);
        var attendance = fest.AddOns[0].Attendance;
        Assert.NotNull(attendance);
        Assert.Equal(
            ["Alice", "Ilka", "Mara"],
            attendance.NotAnswered?.Select(person => person.FirstName)
        );
        Assert.NotNull(attendance.Reminder);
        Assert.Equal(
            ["Alice", "Ilka", "Mara"],
            fest.AddOns[1].Poll?.NotAnswered?.Select(person => person.FirstName)
        );
        Assert.True(fest.ViewerMayEdit);
    }

    [Theory]
    [InlineData("paula")]
    [InlineData("rolf")]
    public async Task Should_OfferNoAnswering_When_TheReaderHoldsNoRunningUnpausedMembership(
        string readerAlias
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await AnnouncementAddOnClub.BuildAsync(_fixture, ct);

        var read = await AnnouncementAddOnClub.ReadAtAsync(
            _fixture,
            ctx,
            readerAlias,
            AnnouncementAddOnClub.Now,
            ct
        );

        Assert.False(Assert.Single(read.Announcements).ViewerMayAnswer);
    }

    [Fact]
    public async Task Should_ShowEveryAddOnClosed_When_TheLastDayOfTheAnnouncementHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await AnnouncementAddOnClub.BuildAsync(_fixture, ct);

        var read = await AnnouncementAddOnClub.ReadAtAsync(
            _fixture,
            ctx,
            "chris",
            AnnouncementAddOnClub.AfterTheLastDay,
            ct
        );

        var addOns = Assert.Single(read.Announcements).AddOns;
        Assert.True(addOns[0].Attendance?.IsClosed);
        Assert.True(addOns[1].Poll?.IsClosed);
        Assert.True(addOns[2].SignUpList?.IsClosed);
    }

    [Fact]
    public async Task Should_ShowTheEntrysResultsWithoutAnswering_When_TheReaderIsNotConcernedByTheEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await AnnouncementAddOnClub.BuildLendingAsync(_fixture, ct, withLoans: true);

        var read = await AnnouncementAddOnClub.ReadAtAsync(
            _fixture,
            ctx,
            "mara",
            AnnouncementAddOnClub.Now,
            ct
        );

        var fest = Assert.Single(read.Announcements);
        var borrowedAttendance = fest.AddOns[3].Borrowed;
        Assert.NotNull(borrowedAttendance);
        Assert.False(borrowedAttendance.Entry.MayAnswer);
        Assert.Equal(
            (0, 1, 0),
            (
                borrowedAttendance.Entry.Attendance?.Yes,
                borrowedAttendance.Entry.Attendance?.Maybe,
                borrowedAttendance.Entry.Attendance?.No
            )
        );
        Assert.True(fest.ViewerMayAnswer);
    }

    [Fact]
    public async Task Should_LeaveOutTheTakenOverAddOn_When_ItsEntryIsMeantForChosenPeople()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await AnnouncementAddOnClub.BuildLendingAsync(_fixture, ct, withLoans: true);

        var read = await AnnouncementAddOnClub.ReadAtAsync(
            _fixture,
            ctx,
            "ilka",
            AnnouncementAddOnClub.Now,
            ct
        );

        var fest = Assert.Single(read.Announcements);
        Assert.DoesNotContain(
            fest.AddOns,
            addOn =>
                addOn.Borrowed?.Entry.CalendarEntryId
                == ctx.Club.CalendarEntries.IdOf("vorstandsrunde")
        );
        Assert.Equal(5, fest.AddOns.Count);
    }

    private static async Task PostAsync(SeededContext ctx, string body, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync(Author, ct);
        var (response, _) = await client.POSTAsync<
            PostAnnouncement,
            PostAnnouncementRequest,
            PostAnnouncementResponse
        >(
            new()
            {
                Title = "Mit Erwähnungen",
                Body = body,
                ValidUntil = null,
                AddOns = [],
                Notify = false,
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
                                "abgelaufen",
                                "alice",
                                "Abgelaufener Aushang",
                                Body,
                                PublishedInJanuary,
                                ExpiredIn2021
                            )
                            .AddAnnouncement(
                                "mittel",
                                "alice",
                                "Mittlerer Aushang",
                                Body,
                                PublishedInFebruary
                            )
                            .AddAnnouncement(
                                "von-bea",
                                "bea",
                                "Neuester Aushang",
                                Body,
                                PublishedInMarch
                            )
                    ),
            ct
        );

    private static bool EditableIn(GetAnnouncementsResponse result, int announcementId) =>
        result
            .Announcements.Single(announcement => announcement.AnnouncementId == announcementId)
            .ViewerMayEdit;

    private static async Task<GetAnnouncementsResponse> ReadAsync(
        SeededContext ctx,
        string alias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<
            GetAnnouncements,
            GetAnnouncementsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
