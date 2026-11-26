using System.Text.RegularExpressions;
using Furria.Core.Club;
using Furria.Core.News;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Assistant;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Assistant.ClubAssistantSteps;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Assistant;

public sealed partial class ClubAssistantToolTests : IClassFixture<ApiTestFixture>
{
    private const string AlicesChatId = "491701234567@c.us";
    private const string PaulasChatId = "491709876543@c.us";
    private const string ClubRoom = "vereinsraum";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private readonly ApiTestFixture _fixture;

    public ClubAssistantToolTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset Now => _fixture.TimeProvider.GetUtcNow();

    private DateOnly Tomorrow => ClubClock.DayOf(Now).AddDays(1);

    [Fact]
    public async Task Should_NameWhatIsThere_When_TheVenueIsTakenAtTheAskedTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "evening",
                        "Vereinsabend",
                        TomorrowAt(14, 0),
                        TomorrowAt(16, 0),
                        venueAlias: ClubRoom
                    )
                    .AddCalendarEntry(
                        "board",
                        "Vorstandsrunde",
                        TomorrowAt(16, 30),
                        TomorrowAt(18, 0),
                        venueAlias: ClubRoom,
                        audiencePersonAliases: ["bob"]
                    ),
            ct
        );

        var occupancy = await ToolResultAsync(
            ctx,
            ClubAssistantTools.VenueOccupancy,
            new
            {
                venue = "Vereinsraum",
                date = Iso(Tomorrow),
                from = "15:00",
                to = "17:00",
            },
            ct
        );

        Assert.Contains("\"isFree\":false", occupancy);
        Assert.Contains("Vereinsabend", occupancy);
        Assert.Contains("\"otherBookings\":1", occupancy);
        Assert.DoesNotContain("Vorstandsrunde", occupancy);
    }

    [Fact]
    public async Task Should_CountTheUsualTraining_When_AGroupUsuallyTrainsInTheVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddUsualTrainingTime(
                    "garde-weekly",
                    "garde",
                    Tomorrow.DayOfWeek,
                    new TimeOnly(18, 30),
                    90,
                    ClubRoom
                ),
            ct
        );

        var occupancy = await ToolResultAsync(
            ctx,
            ClubAssistantTools.VenueOccupancy,
            new
            {
                venue = "vereinsraum",
                date = Iso(Tomorrow),
                from = "19:00",
                to = "20:00",
            },
            ct
        );

        Assert.Contains("\"isFree\":false", occupancy);
        Assert.Contains("Garde", occupancy);
    }

    [Fact]
    public async Task Should_SayTheVenueIsFree_When_NothingOverlapsTheAskedTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                    "evening",
                    "Vereinsabend",
                    TomorrowAt(14, 0),
                    TomorrowAt(16, 0),
                    venueAlias: ClubRoom
                ),
            ct
        );

        var occupancy = await ToolResultAsync(
            ctx,
            ClubAssistantTools.VenueOccupancy,
            new
            {
                venue = "Vereinsraum",
                date = Iso(Tomorrow),
                from = "16:00",
                to = "18:00",
            },
            ct
        );

        Assert.Contains("\"isFree\":true", occupancy);
        Assert.DoesNotContain("Vereinsabend", occupancy);
    }

    [Fact]
    public async Task Should_SayTheVenueIsFree_When_APointInTimeLiesBeforeTheNextBooking()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                    "brunch",
                    "Brunch",
                    TomorrowAt(10, 0),
                    TomorrowAt(12, 0),
                    venueAlias: ClubRoom
                ),
            ct
        );

        var occupancy = await ToolResultAsync(
            ctx,
            ClubAssistantTools.VenueOccupancy,
            new
            {
                venue = "Vereinsraum",
                date = Iso(Tomorrow),
                from = "9",
            },
            ct
        );

        Assert.Contains("\"isFree\":true", occupancy);
    }

    [Fact]
    public async Task Should_LeaveOutUnpublishedEvents_When_TheModelListsEvents()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddEvent("gala", "Prunksitzung", TomorrowAt(19, 11), ClubRoom)
                    .AddEvent(
                        "secret",
                        "Geheimer Ball",
                        TomorrowAt(20, 0),
                        ClubRoom,
                        unpublished: true
                    ),
            ct
        );

        var events = await ToolResultAsync(ctx, ClubAssistantTools.Events, new { }, ct);

        Assert.Contains("Prunksitzung", events);
        Assert.DoesNotContain("Geheimer Ball", events);
    }

    [Fact]
    public async Task Should_GivePositionsWithoutTimes_When_TheModelReadsTheRunningOrder()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PaulaOnWhatsApp(), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        var lied = await CreateActAsync(planner, "Schunkellied", kind: ActKind.Music);
        await SavedAsync(planner, eventId, null, [Line(rede, 0), Line(lied, 1)]);

        var order = await ToolResultAsync(
            ctx,
            ClubAssistantTools.RunningOrder,
            new { eventId },
            ct,
            PaulasChatId
        );

        Assert.Contains("Büttenrede", order);
        Assert.Contains("\"number\":2", order);
        Assert.Contains("\"mayStillChange\":true", order);
        Assert.DoesNotMatch(ClockTime(), order);
    }

    [Fact]
    public async Task Should_RefuseTheRunningOrder_When_TheEventIsUnpublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddEvent(
                    "secret",
                    "Geheimer Ball",
                    TomorrowAt(20, 0),
                    ClubRoom,
                    unpublished: true
                ),
            ct
        );

        var order = await ToolResultAsync(
            ctx,
            ClubAssistantTools.RunningOrder,
            new { eventId = ctx.Club.Events.IdOf("secret") },
            ct
        );

        Assert.DoesNotContain("Geheimer Ball", order);
        Assert.DoesNotContain("number", order);
    }

    [Fact]
    public async Task Should_CountMembersWithoutNames_When_TheModelListsGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);

        var groups = await ToolResultAsync(ctx, ClubAssistantTools.Groups, new { }, ct);

        Assert.Contains("Garde", groups);
        Assert.Contains("\"memberCount\":2", groups);
        Assert.Contains("\"isMine\":true", groups);
        Assert.DoesNotContain("Bob", groups);
        Assert.DoesNotContain("Muster", groups);
    }

    [Fact]
    public async Task Should_ShowCurrentAnnouncementsWithoutPersons_When_TheModelReadsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddAnnouncement(
                        "keys",
                        "bob",
                        "Schlüsselübergabe",
                        "Bitte bei @[Bob Beispiel](person:1) melden.",
                        validUntil: Tomorrow
                    )
                    .AddAnnouncement(
                        "old",
                        "bob",
                        "Alter Aushang",
                        "Längst vorbei.",
                        validUntil: Tomorrow.AddDays(-3)
                    ),
            ct
        );

        var announcements = await ToolResultAsync(
            ctx,
            ClubAssistantTools.Announcements,
            new { },
            ct
        );

        Assert.Contains("Schlüsselübergabe", announcements);
        Assert.DoesNotContain("Alter Aushang", announcements);
        Assert.DoesNotContain("Bob", announcements);
    }

    [Fact]
    public async Task Should_ShowOnlyPublishedNews_When_TheModelReadsTheNews()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .News(news =>
                        news.AddNewsPost(
                                "won",
                                "Garde gewinnt Pokal",
                                "Erster Platz beim Turnier.",
                                category: NewsCategory.Achievements,
                                publishedAt: Now.AddDays(-2),
                                slug: "garde-gewinnt-pokal"
                            )
                            .AddNewsPost("draft", "Noch geheim", "Entwurf.")
                    ),
            ct
        );

        var news = await ToolResultAsync(ctx, ClubAssistantTools.News, new { }, ct);

        Assert.Contains("Garde gewinnt Pokal", news);
        Assert.Contains("garde-gewinnt-pokal", news);
        Assert.DoesNotContain("Noch geheim", news);
    }

    private DateTimeOffset TomorrowAt(int hour, int minute) =>
        ClubClock.At(Tomorrow, new TimeOnly(hour, minute));

    private async Task<string> ToolResultAsync(
        SeededContext ctx,
        string tool,
        object arguments,
        CancellationToken ct,
        string chatId = AlicesChatId
    )
    {
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            FakeModelReply.Calling(tool, arguments),
            FakeModelReply.Saying("Erledigt.")
        );

        await AskAsync(_fixture, chatId, "Sag mal…", ct);

        return Assert.Single(_fixture.Model.ToolResults());
    }

    private Task<SeededContext> BuildClubAsync(
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .Club(clubBuilder => club(clubBuilder.AddVenue(ClubRoom, "Vereinsraum"))),
            ct
        );

    private static SeedContextBuilder AliceInTheGarde(SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson("alice", "Alice", "Muster")
                    .AddPersonContact("alice", phone: "0170 1234567")
                    .AddMembership("alice-first", "alice", JoinedIn2017)
                    .AddPerson("bob", "Bob", "Beispiel")
            )
            .Groups(groups =>
                groups
                    .AddGroup("garde", "Garde")
                    .AddGroupMembership("alice-garde", "garde", "alice")
                    .AddGroupMembership("bob-garde", "garde", "bob")
            );

    private Action<SeedContextBuilder> PaulaOnWhatsApp() =>
        builder =>
        {
            PlannerWithGala(ClubClock.DayOf(Now))(builder);
            builder.Identity(identity => identity.AddPersonContact(Planner, phone: "0170 9876543"));
        };

    [GeneratedRegex(@"\d{1,2}:\d{2}")]
    private static partial Regex ClockTime();
}
