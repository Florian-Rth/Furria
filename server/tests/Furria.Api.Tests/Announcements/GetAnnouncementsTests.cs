using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

[Collection("Api")]
public sealed class GetAnnouncementsTests
{
    private const string Body = "Der Saal bleibt am Freitag geschlossen.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly SeatedIn2023 = new(2023, 3, 1);
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
    public async Task Should_CarryTheExpiredAnnouncementToo_When_TheBoardIsReadInFull()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var result = await ReadAsync(ctx, "chris", ct);

        Assert.Equal(
            [
                ctx.Club.Announcements.IdOf("von-bea"),
                ctx.Club.Announcements.IdOf("mittel"),
                ctx.Club.Announcements.IdOf("abgelaufen"),
            ],
            result.Announcements.Select(announcement => announcement.AnnouncementId)
        );
    }

    [Fact]
    public async Task Should_LeaveTheOfficeEmpty_When_TheAuthorHoldsNoBoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var result = await ReadAsync(ctx, "chris", ct);
        var author = result
            .Announcements.Single(announcement =>
                announcement.AnnouncementId == ctx.Club.Announcements.IdOf("mittel")
            )
            .Author;

        Assert.Equal(ctx.Identity.People.IdOf("alice"), author.PersonId);
        Assert.Equal("Alice", author.FirstName);
        Assert.Equal("Muster", author.LastName);
        Assert.Null(author.PortraitUrl);
        Assert.Null(author.OfficeName);
    }

    [Fact]
    public async Task Should_NameTheAuthorsOffice_When_SheHoldsARunningBoardSeat()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Muster")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident")
                            .AddBoardSeat("alice-praesident", "praesident", "alice", SeatedIn2023)
                            .AddAnnouncement("gruss", "alice", "Gruß", Body)
                    ),
            ct
        );

        var result = await ReadAsync(ctx, "alice", ct);

        var author = Assert.Single(result.Announcements).Author;
        Assert.Equal(ctx.Identity.People.IdOf("alice"), author.PersonId);
        Assert.Equal("Präsident", author.OfficeName);
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
    public async Task Should_OfferEditingEveryAnnouncement_When_TheReaderHoldsThePermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var result = await ReadAsync(ctx, "bea", ct);

        Assert.True(EditableIn(result, ctx.Club.Announcements.IdOf("mittel")));
        Assert.True(EditableIn(result, ctx.Club.Announcements.IdOf("von-bea")));
    }

    [Fact]
    public async Task Should_OfferNoEditing_When_TheReaderIsNeitherAutorNorBerechtigt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildBoardAsync(ct);

        var result = await ReadAsync(ctx, "chris", ct);

        Assert.DoesNotContain(result.Announcements, announcement => announcement.ViewerMayEdit);
    }

    [Fact]
    public async Task Should_CarryAnEmptyBoard_When_NobodyHasHungAnythingUp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("chris", "Chris", "Leser")
                        .AddAccount("chris")
                        .AddMembership("chris-first", "chris", JoinedIn2017)
                ),
            ct
        );

        var result = await ReadAsync(ctx, "chris", ct);

        Assert.Empty(result.Announcements);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, _) = await client.GETAsync<GetAnnouncements, GetAnnouncementsResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetAnnouncements, GetAnnouncementsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
