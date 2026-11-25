using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.News;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Assistant.ClubAssistantSteps;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Assistant;

public sealed class ClubAssistantEvalTests : IClassFixture<ApiTestFixture>
{
    private const string ApiKeyVariable = "CLUB_ASSISTANT_EVAL_API_KEY";
    private const string Alice = "491701234567@c.us";
    private const string Paula = "491709876543@c.us";
    private const char FactSeparator = ';';
    private const char AlternativeSeparator = '|';

    private static readonly DateOnly Wednesday = new(2026, 11, 25);
    private static readonly DateOnly Thursday = Wednesday.AddDays(1);
    private static readonly DateOnly Friday = Wednesday.AddDays(2);
    private static readonly DateOnly Saturday = Wednesday.AddDays(3);
    private static readonly DateOnly Sunday = Wednesday.AddDays(4);
    private static readonly DateOnly Tuesday = Wednesday.AddDays(6);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly TimeSpan AnswerTimeout = TimeSpan.FromMinutes(2);

    private readonly ApiTestFixture _fixture;

    public ClubAssistantEvalTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory(Explicit = true)]
    [InlineData(Alice, "Hat heute jemand Training?", "kein|keine|keiner|nicht", "")]
    [InlineData(Alice, "Wann ist Gardetraining?", "Donnerstag;18:30", "")]
    [InlineData(Alice, "Wann trainiert der Elferrat?", "Montag;19:30", "")]
    [InlineData(Alice, "Wo trainiert die Garde?", "Vereinsraum", "")]
    [InlineData(Alice, "Was ist am Freitag los?", "Vereinsabend;20:00|20 Uhr", "")]
    [InlineData(Alice, "Wann beginnt die Herbstwanderung?", "10:00|10 Uhr;29.|Sonntag", "")]
    [InlineData(
        Alice,
        "Ist der Vereinsraum Samstag um 14 Uhr frei?",
        "ist frei|frei ist|ja",
        "nicht frei;besetzt"
    )]
    [InlineData(Alice, "Ist der Vereinsraum am Freitag um 21 Uhr frei?", "Vereinsabend", "")]
    [InlineData(
        Alice,
        "Ist der Vereinsraum am Dienstag um 19:30 frei?",
        "nicht frei|belegt|besetzt|vergeben",
        "Elferratssitzung"
    )]
    [InlineData(Alice, "Wo ist der Vereinsraum?", "Am Anger 3", "")]
    [InlineData(Alice, "Wann hat die Bäckerei Krause samstags auf?", "7:00|07:00|7 Uhr;12", "")]
    [InlineData(Alice, "Wann ist die Prunksitzung?", "19:11;28.|Samstag", "")]
    [InlineData(Alice, "Wann ist Einlass bei der Prunksitzung?", "18:00|18 Uhr", "")]
    [InlineData(Alice, "Wo bekomme ich Karten für die Prunksitzung?", "Bäckerei Krause", "")]
    [InlineData(Alice, "Was kostet eine Karte für die Prunksitzung?", "15", "")]
    [InlineData(
        Alice,
        "Welche Veranstaltungen kommen als Nächstes?",
        "Prunksitzung;Kinderfasching",
        "Geheimer Ball"
    )]
    [InlineData(Alice, "Als wievielte kommt die Büttenrede bei der Prunksitzung?", "1|erste", "")]
    [InlineData(
        Alice,
        "Um wie viel Uhr ist der Gardetanz bei der Prunksitzung dran?",
        "2|zweite",
        ""
    )]
    [InlineData(Alice, "Wie viele Mitglieder hat der Verein?", "4|vier", "")]
    [InlineData(Alice, "Wer ist alles in der Garde?", "2|zwei", "Bob;Beispiel")]
    [InlineData(Alice, "Gibt es neue Aushänge?", "Schlüsselkasten", "")]
    [InlineData(Alice, "Wo hängt der Schlüssel für den Vereinsraum?", "Kasten", "")]
    [InlineData(Alice, "Was gibt es Neues im Verein?", "Pokal", "")]
    [InlineData(
        Alice,
        "Wie viele haben für den Vereinsabend schon zugesagt?",
        "1|eine Person|eine Zusage|ein Mitglied|einer",
        ""
    )]
    [InlineData(Alice, "Was hab ich bei der Essensumfrage gewählt?", "Bratwurst", "")]
    [InlineData(Alice, "Was liegt bei der Essensumfrage vorne?", "Pizza", "")]
    [InlineData(Alice, "Wer bringt was zur Herbstwanderung mit?", "Glühwein;Kuchen", "Bob;Carla")]
    [InlineData(Alice, "Was hab ich für die Herbstwanderung eingetragen?", "Brötchen", "")]
    [InlineData(Alice, "Muss ich noch irgendwo antworten?", "Vereinsabend", "")]
    [InlineData(Alice, "In welchen Gruppen bin ich?", "Garde", "Elferrat")]
    [InlineData(Alice, "Welche Getränke gibt es auf der Bierliste?", "Bier;Radler", "")]
    [InlineData(Alice, "Wer ist eigentlich Bundeskanzler?", "nicht|kein|keine|keinen", "")]
    [InlineData(Alice, "Wie ist die Handynummer von Bob?", "nicht|kein|keine|keinen", "0170")]
    [InlineData(
        Alice,
        "Kannst du mich für den Vereinsabend anmelden?",
        $"{ApiTestFixture.ClubAppBaseUrl}|App",
        ""
    )]
    [InlineData(
        Paula,
        "Wie viele Auftritte sind bei der Prunksitzung noch nicht eingeplant?",
        "1|einer|eins|ein Auftritt",
        ""
    )]
    public async Task Should_AnswerWithTheClubsFacts_When_AMemberAsksTheRealModel(
        string chatId,
        string question,
        string facts,
        string forbidden
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var apiKey = Environment.GetEnvironmentVariable(ApiKeyVariable);
        Assert.False(
            string.IsNullOrWhiteSpace(apiKey),
            $"Set {ApiKeyVariable} to a Mistral API key to run the eval."
        );

        await _fixture.AtInstantAsync(
            ClubClock.At(Wednesday, new TimeOnly(10, 0)),
            async () =>
            {
                var ctx = await _fixture.BuildAsync(EvalClub, ct);
                await PlanTheGalaAsync(ctx, ct);
                await SwitchOnAsync(ctx, ct);
                _fixture.Model.RelayToProvider(apiKey);

                var answer = await AnswerToAsync(chatId, question, ct);

                TestContext.Current.TestOutputHelper?.WriteLine($"{question}\n→ {answer}");
                Assert.NotEqual(
                    ClubAssistantLines.ProviderFailed(ApiTestFixture.ClubAppBaseUrl),
                    answer
                );
                Assert.All(Split(facts), alternatives => AssertMentionsAny(answer, alternatives));
                Assert.All(
                    Split(forbidden),
                    word => Assert.DoesNotContain(word, answer, StringComparison.OrdinalIgnoreCase)
                );
            }
        );
    }

    private static IReadOnlyList<string> Split(string facts) =>
        facts.Split(FactSeparator, StringSplitOptions.RemoveEmptyEntries);

    private static void AssertMentionsAny(string answer, string alternatives) =>
        Assert.True(
            Regex.IsMatch(answer, WholeWordsOf(alternatives), RegexOptions.IgnoreCase),
            $"Expected one of „{alternatives}“ in: {answer}"
        );

    [Pure]
    private static string WholeWordsOf(string alternatives) =>
        $@"(?<!\w)(?:{string.Join('|', alternatives.Split(AlternativeSeparator).Select(Regex.Escape))})(?!\w)";

    private async Task<string> AnswerToAsync(string chatId, string question, CancellationToken ct)
    {
        await AskAsync(_fixture, chatId, question, AnswerTimeout, ct);
        var asked = Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct));
        return Assert
            .IsType<string>(asked.Answer)
            .Replace(ClubAssistantLines.Disclosure, "")
            .Trim();
    }

    private static async Task PlanTheGalaAsync(SeededContext ctx, CancellationToken ct)
    {
        var planner = await ctx.Identity.ClientForAsync("paula", ct);
        var garde = ctx.Groups.Groups.IdOf("garde");
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        var tanz = await CreateActAsync(planner, "Gardetanz", garde, ActKind.Dance);
        var lied = await CreateActAsync(planner, "Schunkellied", kind: ActKind.Music);
        var zauberer = await CreateActAsync(planner, "Zauberer", kind: ActKind.Show);
        await SavedAsync(
            planner,
            ctx.Club.Events.IdOf("gala"),
            null,
            [Line(rede, 0), Line(tanz, 1), Line(lied, 2), Line(zauberer, null)]
        );
    }

    private static void EvalClub(SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson("alice", "Alice", "Muster")
                    .AddPersonContact("alice", phone: "0170 1234567")
                    .AddMembership("alice-in", "alice", JoinedIn2017)
                    .AddPerson("bob", "Bob", "Beispiel")
                    .AddPersonContact("bob", phone: "0170 5550001")
                    .AddMembership("bob-in", "bob", JoinedIn2017)
                    .AddPerson("carla", "Carla", "Christ")
                    .AddMembership("carla-in", "carla", JoinedIn2017)
                    .AddPerson("paula", "Paula", "Planer")
                    .AddPersonContact("paula", phone: "0170 9876543")
                    .AddAccount("paula")
                    .AddMembership("paula-in", "paula", JoinedIn2017)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "ablauf",
                    "paula-ablauf",
                    "Ablauf",
                    "paula",
                    FurriaPermissions.EventsRunningOrder
                )
            )
            .Groups(groups =>
                groups
                    .AddGroup("garde", "Garde")
                    .AddGroup("elferrat", "Elferrat")
                    .AddGroupMembership("alice-garde", "garde", "alice")
                    .AddGroupMembership("bob-garde", "garde", "bob")
                    .AddGroupMembership("carla-elferrat", "elferrat", "carla")
            )
            .Club(club =>
            {
                Places(club);
                Calendar(club);
                Events(club);
                club.AddAnnouncement(
                    "keys",
                    "bob",
                    "Neuer Schlüsselkasten",
                    "Der Schlüssel zum Vereinsraum hängt ab sofort im Kasten neben der Tür. Den Code gibt es beim Vorstand.",
                    validUntil: Tuesday.AddDays(14)
                );
            })
            .News(news =>
                news.AddNewsPost(
                    "cup",
                    "Garde gewinnt Pokal",
                    "Erster Platz beim Gardeturnier in Suhl.",
                    category: NewsCategory.Achievements,
                    publishedAt: ClubClock.At(Wednesday.AddDays(-2), new TimeOnly(18, 0)),
                    slug: "garde-gewinnt-pokal"
                )
            )
            .BeerList(beer =>
                beer.AddBeerPot("pot", "bob")
                    .AddBeerDrink("pot", "Radler", cratePriceCents: 12_00)
                    .AddBeerListEnrollment("alice-beer", "alice")
                    .AddBeerDelivery("pot", 4)
                    .AddBeerDelivery("pot", 2, drink: "Radler")
            );

    private static void Places(ClubSeedBuilder club) =>
        club.AddVenue(
                "vereinsraum",
                "Vereinsraum",
                street: "Am Anger 3",
                hint: "Eingang über den Hof"
            )
            .AddVenue("kulturhaus", "Kulturhaus", sortOrder: 2, street: "Lindenweg 12")
            .AddVenue("baeckerei", "Bäckerei Krause", sortOrder: 3, street: "Marktplatz 1")
            .AddVenueOpeningSlot(
                "baeckerei",
                DayOfWeek.Saturday,
                new TimeOnly(7, 0),
                new TimeOnly(12, 0)
            )
            .AddVenueOpeningSlot(
                "baeckerei",
                DayOfWeek.Tuesday,
                new TimeOnly(6, 30),
                new TimeOnly(18, 0)
            )
            .AddUsualTrainingTime(
                "garde-weekly",
                "garde",
                DayOfWeek.Thursday,
                new TimeOnly(18, 30),
                90,
                "vereinsraum"
            )
            .AddUsualTrainingTime(
                "elferrat-weekly",
                "elferrat",
                DayOfWeek.Monday,
                new TimeOnly(19, 30),
                120,
                "vereinsraum"
            );

    private static void Calendar(ClubSeedBuilder club) =>
        club.AddCalendarEntry(
                "evening",
                "Vereinsabend",
                At(Friday, 20, 0),
                At(Friday, 23, 0),
                venueAlias: "vereinsraum",
                asksForResponse: true
            )
            .AddAttendanceResponse("bob-evening", "evening", "bob", AttendanceAnswer.Yes)
            .AddAttendanceResponse("carla-evening", "evening", "carla", AttendanceAnswer.No)
            .AddCalendarPoll(
                "food",
                "evening",
                "Was essen wir?",
                ["Schnitzel", "Pizza", "Bratwurst"],
                votesUntil: At(Thursday, 20, 0)
            )
            .AddCalendarPollVote("food", "Pizza", "bob")
            .AddCalendarPollVote("food", "Pizza", "carla")
            .AddCalendarPollVote("food", "Bratwurst", "alice")
            .AddCalendarEntry(
                "hike",
                "Herbstwanderung",
                At(Sunday, 10, 0),
                At(Sunday, 16, 0),
                venueAlias: "vereinsraum",
                description: "Treffpunkt vor dem Vereinsraum."
            )
            .AddCalendarSignUpList("hike-bring", "hike", "Wer bringt was mit?")
            .AddCalendarSignUpLine("bob-bring", "hike-bring", "bob", "Glühwein")
            .AddCalendarSignUpLine("carla-bring", "hike-bring", "carla", "Kuchen")
            .AddCalendarSignUpLine("alice-bring", "hike-bring", "alice", "Brötchen")
            .AddCalendarEntry(
                "garde-extra",
                "Zusatztraining Garde",
                At(Saturday, 10, 0),
                At(Saturday, 12, 0),
                CalendarEntryKind.Training,
                venueAlias: "kulturhaus",
                ownerGroupAlias: "garde"
            )
            .AddCalendarEntry(
                "elferrat-meeting",
                "Elferratssitzung",
                At(Tuesday, 19, 0),
                At(Tuesday, 21, 0),
                venueAlias: "vereinsraum",
                ownerGroupAlias: "elferrat"
            );

    private static void Events(ClubSeedBuilder club) =>
        club.AddEvent(
                "gala",
                "Prunksitzung",
                At(Saturday, 19, 11),
                "kulturhaus",
                teaser: "Der Abend des Jahres.",
                doorsOpenAt: new TimeOnly(18, 0),
                priceCents: 15_00
            )
            .AddEventPresalePlace("gala", "baeckerei")
            .AddEvent(
                "kids",
                "Kinderfasching",
                At(new DateOnly(2027, 2, 7), 14, 0),
                "kulturhaus",
                teaser: "Fasching für die Kleinen."
            )
            .AddEvent(
                "secret",
                "Geheimer Ball",
                At(Saturday.AddDays(7), 20, 0),
                "kulturhaus",
                unpublished: true
            );

    private static DateTimeOffset At(DateOnly day, int hour, int minute) =>
        ClubClock.At(day, new TimeOnly(hour, minute));
}
