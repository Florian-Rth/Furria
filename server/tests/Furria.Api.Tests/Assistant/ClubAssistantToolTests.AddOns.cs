using Furria.Core.Club;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Builder;
using Xunit;

namespace Furria.Api.Tests.Assistant;

public sealed partial class ClubAssistantToolTests
{
    private const string Garden = "Gartenfest";

    [Fact]
    public async Task Should_GiveCountsLineTextsAndOwnAnswers_When_AnEntryHoldsAddOns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "garden",
                        Garden,
                        TomorrowAt(14, 0),
                        TomorrowAt(20, 0),
                        asksForResponse: true
                    )
                    .AddAttendanceResponse("alice-yes", "garden", "alice", AttendanceAnswer.Yes)
                    .AddAttendanceResponse("bob-no", "garden", "bob", AttendanceAnswer.No)
                    .AddCalendarPoll("drinks", "garden", "Was trinken wir?", ["Bier", "Wein"])
                    .AddCalendarPollVote("drinks", "Bier", "alice")
                    .AddCalendarPollVote("drinks", "Wein", "bob")
                    .AddCalendarSignUpList("food", "garden", "Wer bringt was mit?")
                    .AddCalendarSignUpLine("alice-salad", "food", "alice", "Nudelsalat")
                    .AddCalendarSignUpLine("bob-cake", "food", "bob", "Käsekuchen")
                    .AddCalendarDaySchedule("plan", "garden", "Ablauf")
                    .AddCalendarDayScheduleStep("grill", "plan", 0, new TimeOnly(15, 0), "Grill an")
                    .AddCalendarDayScheduleStep("band", "plan", 0, new TimeOnly(18, 30), "Band"),
            ct
        );

        var addOns = await ToolResultAsync(
            ctx,
            ClubAssistantTools.AddOns,
            new { calendarEntryId = ctx.Club.CalendarEntries.IdOf("garden") },
            ct
        );

        Assert.Contains(Garden, addOns);
        Assert.Contains("\"yes\":1", addOns);
        Assert.Contains("\"no\":1", addOns);
        Assert.Contains("\"yourAnswer\":\"Zusage\"", addOns);
        Assert.Contains("\"label\":\"Bier\",\"votes\":1,\"chosenByYou\":true", addOns);
        Assert.Contains("\"label\":\"Wein\",\"votes\":1,\"chosenByYou\":false", addOns);
        Assert.Contains("Käsekuchen", addOns);
        Assert.Contains("\"yourLine\":\"Nudelsalat\"", addOns);
        Assert.Contains("Grill an", addOns);
        Assert.Contains("18:30", addOns);
        AssertNamesNobody(addOns);
    }

    [Fact]
    public async Task Should_CountAnonymousVotesAndTheOwnAnswer_When_AnAnnouncementHoldsAddOns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddAnnouncement(
                        "trip",
                        "bob",
                        "Busfahrt",
                        "Wer fährt mit?",
                        Now.AddDays(-1),
                        attendance: new AnnouncementAttendanceIntent()
                    )
                    .AddAnnouncementResponse("alice-maybe", "trip", "alice", AttendanceAnswer.Maybe)
                    .AddAnnouncementResponse("bob-yes", "trip", "bob", AttendanceAnswer.Yes)
                    .AddAnnouncementPoll(
                        "seat",
                        "trip",
                        "Wo sitzt du?",
                        ["Vorne", "Hinten"],
                        isAnonymous: true,
                        position: 1
                    )
                    .AddCalendarPollVote("seat", "Hinten", "bob")
                    .AddCalendarPollVote("seat", "Hinten", "alice"),
            ct
        );

        var addOns = await ToolResultAsync(
            ctx,
            ClubAssistantTools.AddOns,
            new { announcementId = ctx.Club.Announcements.IdOf("trip") },
            ct
        );

        Assert.Contains("Busfahrt", addOns);
        Assert.Contains("\"yes\":1", addOns);
        Assert.Contains("\"maybe\":1", addOns);
        Assert.Contains("\"yourAnswer\":\"Vielleicht\"", addOns);
        Assert.Contains("\"isAnonymous\":true", addOns);
        Assert.Contains("\"label\":\"Hinten\",\"votes\":2,\"chosenByYou\":true", addOns);
        AssertNamesNobody(addOns);
    }

    [Fact]
    public async Task Should_NameTheEntry_When_AnAnnouncementTakesOverItsAddOns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "garden",
                        Garden,
                        TomorrowAt(14, 0),
                        asksForResponse: true,
                        audienceGroupAliases: ["garde"]
                    )
                    .AddCalendarPoll("drinks", "garden", "Was trinken wir?", ["Bier", "Wein"])
                    .AddCalendarPollVote("drinks", "Wein", "bob")
                    .AddAttendanceResponse("bob-yes", "garden", "bob", AttendanceAnswer.Yes)
                    .AddAnnouncement("invite", "bob", "Einladung", "Kommt alle!", Now.AddDays(-1))
                    .AddAnnouncementLoan(
                        "invite",
                        "garden",
                        AnnouncementAddOnKind.Attendance,
                        null,
                        0
                    )
                    .AddAnnouncementLoan(
                        "invite",
                        "garden",
                        AnnouncementAddOnKind.Poll,
                        "drinks",
                        1
                    ),
            ct
        );

        var addOns = await ToolResultAsync(
            ctx,
            ClubAssistantTools.AddOns,
            new { announcementId = ctx.Club.Announcements.IdOf("invite") },
            ct
        );

        Assert.Contains("\"youMayAnswer\":true", addOns);
        Assert.Contains("\"yes\":1", addOns);
        Assert.Contains("\"label\":\"Wein\",\"votes\":1,\"chosenByYou\":false", addOns);
        Assert.Contains($"\"takenFrom\":\"{Garden}\"", addOns);
        AssertNamesNobody(addOns);
    }

    [Fact]
    public async Task Should_KeepTheEntryHidden_When_TheAskerDoesNotSeeIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "board",
                        "Vorstandsrunde",
                        TomorrowAt(18, 0),
                        asksForResponse: true,
                        audiencePersonAliases: ["bob"]
                    )
                    .AddAttendanceResponse("bob-yes", "board", "bob", AttendanceAnswer.Yes),
            ct
        );

        var addOns = await ToolResultAsync(
            ctx,
            ClubAssistantTools.AddOns,
            new { calendarEntryId = ctx.Club.CalendarEntries.IdOf("board") },
            ct
        );

        Assert.DoesNotContain("Vorstandsrunde", addOns);
        Assert.DoesNotContain("\"yes\"", addOns);
    }

    [Fact]
    public async Task Should_ListGroupsOpenAnswersAndOwnResponses_When_AskedForMyThings()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry(
                        "garden",
                        Garden,
                        TomorrowAt(14, 0),
                        asksForResponse: true,
                        audienceGroupAliases: ["garde"]
                    )
                    .AddCalendarEntry(
                        "parade",
                        "Umzug",
                        TomorrowAt(11, 0),
                        asksForResponse: true,
                        audienceGroupAliases: ["garde"]
                    )
                    .AddAttendanceResponse("alice-no", "parade", "alice", AttendanceAnswer.No)
                    .AddAttendanceResponse("bob-yes", "garden", "bob", AttendanceAnswer.Yes),
            ct
        );

        var mine = await ToolResultAsync(ctx, ClubAssistantTools.MyThings, new { }, ct);

        Assert.Contains("\"groups\":[\"Garde\"]", mine);
        Assert.Matches($"\"openAnswers\":\\[[^\\]]*{Garden}", mine);
        Assert.Matches("\"ownResponses\":\\[[^\\]]*Umzug[^\\]]*Absage", mine);
        Assert.DoesNotMatch($"\"ownResponses\":\\[[^\\]]*{Garden}", mine);
        AssertNamesNobody(mine);
    }

    [Fact]
    public async Task Should_ShowStockAndOwnBalance_When_TheAskerTakesFromTheBeerList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .BeerList(beer =>
                        beer.AddBeerPot("pot", "bob", cratePriceCents: 1500)
                            .AddBeerListEnrollment("alice-in", "alice")
                            .AddBeerDelivery("pot", 5)
                            .AddBeerCrates("pot", "alice", 2)
                    ),
            ct
        );

        var beer = await ToolResultAsync(ctx, ClubAssistantTools.BeerList, new { }, ct);

        Assert.Contains("\"inStock\":true", beer);
        Assert.Contains("\"openCrates\":2", beer);
        Assert.Contains("\"openEuros\":30", beer);
        AssertNamesNobody(beer);
    }

    [Fact]
    public async Task Should_KeepEachPaymentLinkWithItsTab_When_TheAskerOwesInTwoPots()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .BeerList(beer =>
                        beer.AddBeerPot(
                                "old",
                                "bob",
                                cratePriceCents: 1000,
                                paymentLink: "https://pay.example/old",
                                openedAt: Now.AddDays(-60),
                                closedAt: Now.AddDays(-30)
                            )
                            .AddBeerPot(
                                "new",
                                "bob",
                                cratePriceCents: 1500,
                                paymentLink: "https://pay.example/new",
                                openedAt: Now.AddDays(-30)
                            )
                            .AddBeerListEnrollment("alice-in", "alice")
                            .AddBeerCrates("old", "alice", 1, Now.AddDays(-40))
                            .AddBeerCrates("new", "alice", 2)
                    ),
            ct
        );

        var beer = await ToolResultAsync(ctx, ClubAssistantTools.BeerList, new { }, ct);

        Assert.Contains("\"openCrates\":3", beer);
        Assert.Contains("\"openEuros\":40", beer);
        Assert.Contains(
            "\"openCrates\":1,\"openEuros\":10,\"paymentLink\":\"https://pay.example/old\"",
            beer
        );
        Assert.Contains(
            "\"openCrates\":2,\"openEuros\":30,\"paymentLink\":\"https://pay.example/new\"",
            beer
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheDrinks_When_TheAskerDoesNotTakeFromTheBeerList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .BeerList(beer => beer.AddBeerPot("pot", "bob").AddBeerDelivery("pot", 5)),
            ct
        );

        var beer = await ToolResultAsync(ctx, ClubAssistantTools.BeerList, new { }, ct);

        Assert.DoesNotContain("inStock", beer);
        Assert.Contains("\"openCrates\":0", beer);
    }

    private static void AssertNamesNobody(string toolResult)
    {
        Assert.DoesNotContain("Alice", toolResult);
        Assert.DoesNotContain("Muster", toolResult);
        Assert.DoesNotContain("Bob", toolResult);
        Assert.DoesNotContain("Beispiel", toolResult);
    }
}
