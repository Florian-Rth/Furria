using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Core.Club;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Assistant;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.Assistant;

public sealed class ClubAssistantAnswerTests : IClassFixture<ApiTestFixture>
{
    private const string AlicesChatId = "491701234567@c.us";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private readonly ApiTestFixture _fixture;

    public ClubAssistantAnswerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset Now => _fixture.TimeProvider.GetUtcNow();

    private DateOnly Today => ClubClock.DayOf(Now);

    [Fact]
    public async Task Should_AnswerFromTheCalendar_When_AMemberAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club => club.AddCalendarEntry("evening", "Vereinsabend", Now.AddHours(2)),
            ct
        );
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            FakeModelReply.Calling(ClubAssistantTools.CalendarEntries, TodayAndTomorrow()),
            FakeModelReply.Saying("Heute um *20:00* ist Vereinsabend! 🎉")
        );

        await AskAsync("Was ist heute los?", ct);

        var answer = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal(
            (AlicesChatId, ClubAssistantLines.Introduced("Heute um *20:00* ist Vereinsabend! 🎉")),
            (answer.ChatId, answer.Text)
        );
        Assert.Contains("Vereinsabend", Assert.Single(_fixture.Model.ToolResults()));
        var question = Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct));
        Assert.Equal(answer.Text, question.Answer);
    }

    [Fact]
    public async Task Should_IntroduceItselfOnlyOnce_When_SheAsksAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(FakeModelReply.Saying("Erste."), FakeModelReply.Saying("Zweite."));

        await AskAsync("Erste Frage?", ct);
        await AskAsync("Zweite Frage?", ct);

        Assert.Equal(
            [ClubAssistantLines.Introduced("Erste."), "Zweite."],
            _fixture.Waha.Sent.Select(sent => sent.Text)
        );
    }

    [Fact]
    public async Task Should_RememberTheConversation_When_SheFollowsUpWithinHalfAnHour()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            FakeModelReply.Saying("Am Dienstag."),
            FakeModelReply.Saying("Halle.")
        );

        await AskAsync("Wann ist Training?", ct);
        await AskAsync("Und wo?", ct);

        var followUp = _fixture.Model.Requests[^1]["messages"]!.ToJsonString();
        Assert.Contains("Wann ist Training?", followUp);
        Assert.Contains("Am Dienstag.", followUp);
    }

    [Fact]
    public async Task Should_ShowOnlyEntriesSheMaySee_When_TheModelReadsTheCalendar()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddCalendarEntry("evening", "Vereinsabend", Now.AddHours(2))
                    .AddCalendarEntry(
                        "board",
                        "Vorstandsrunde",
                        Now.AddHours(3),
                        audiencePersonAliases: ["bob"]
                    )
                    .AddCalendarEntry(
                        "fitting",
                        "Kostümprobe",
                        Now.AddHours(4),
                        audiencePersonAliases: ["alice", "bob"]
                    ),
            ct
        );
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            FakeModelReply.Calling(ClubAssistantTools.CalendarEntries, TodayAndTomorrow()),
            FakeModelReply.Saying("Vereinsabend und Kostümprobe.")
        );

        await AskAsync("Was steht heute an?", ct);

        var seen = Assert.Single(_fixture.Model.ToolResults());
        Assert.Contains("Vereinsabend", seen);
        Assert.Contains("Kostümprobe", seen);
        Assert.DoesNotContain("Vorstandsrunde", seen);
        Assert.DoesNotContain("Bob", seen);
        Assert.DoesNotContain("Beispiel", seen);
    }

    [Fact]
    public async Task Should_ListUsualTrainings_When_TheModelAsksForThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddUsualTrainingTime(
                    "garde-weekly",
                    "garde",
                    Today.AddDays(1).DayOfWeek,
                    new TimeOnly(18, 30),
                    90
                ),
            ct
        );
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            FakeModelReply.Calling(
                ClubAssistantTools.UsualTrainings,
                new { from = Iso(Today), to = Iso(Today.AddDays(6)) }
            ),
            FakeModelReply.Saying("Morgen um *18:30*.")
        );

        await AskAsync("Wann trainiert die Garde?", ct);

        var trainings = Assert.Single(_fixture.Model.ToolResults());
        Assert.Contains("Garde", trainings);
        Assert.Contains("18:30", trainings);
        Assert.Contains("20:00", trainings);
        Assert.Contains("90", trainings);
    }

    [Fact]
    public async Task Should_StopWithTheBudgetLine_When_TheBudgetRunsOutMidQuestion()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(
            new FakeModelReply(null, ClubAssistantTools.ClubBasics, "{}", OutputTokens: 3_000_000)
        );

        await AskAsync("Wie heißt der Verein?", ct);

        Assert.Single(_fixture.Model.Requests);
        Assert.Contains("Fass leer", Assert.Single(_fixture.Waha.Sent).Text);
        Assert.False(await _fixture.ClubAssistantHasBudgetLeftAsync(ct));
    }

    [Fact]
    public async Task Should_ApologiseWithoutRetrying_When_TheProviderFails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Fail(1);

        await AskAsync("Wann ist Training?", ct);

        Assert.Single(_fixture.Model.Requests);
        Assert.Contains("Pappnase", Assert.Single(_fixture.Waha.Sent).Text);
        Assert.NotNull(Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct)).AnsweredAt);
    }

    [Fact]
    public async Task Should_TellTheModelWhoAsksAndWhen_When_TheQuestionArrives()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);
        await SwitchOnAsync(ctx, ct);

        await AskAsync("Hallo!", ct);

        var prompt = _fixture.Model.SystemPrompt();
        Assert.NotNull(prompt);
        Assert.Contains("Alice (Gruppen: Garde)", prompt);
        Assert.Contains(ClubAssistantFacts.MomentOf(Now).Date, prompt);
    }

    private object TodayAndTomorrow() => new { from = Iso(Today), to = Iso(Today.AddDays(1)) };

    private static string Iso(DateOnly day) => day.ToString("yyyy-MM-dd");

    private async Task AskAsync(string text, CancellationToken ct)
    {
        var client = _fixture.CreateClient();
        var received = await DeliverAsync(
            client,
            Message(AlicesChatId, text, Now.AddSeconds(-20)),
            $"message-{Guid.NewGuid():N}",
            ct
        );
        Assert.Equal(HttpStatusCode.OK, received.StatusCode);
        await _fixture.WhatsAppInboxDrainedAsync(ct);
        await _fixture.ClubAssistantAnsweredAsync(ct);
        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        _fixture.TimeProvider.SetUtcNow(Now.AddMinutes(1));
    }

    private static async Task SwitchOnAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAssistant, PutClubAssistantRequest>(
            new()
            {
                IsEnabled = true,
                MonthlyBudgetEuros = 10m,
                QuestionsPerPersonPerDay = 30,
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private Task<SeededContext> BuildClubAsync(
        Action<ClubSeedBuilder> club,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
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
                    )
                    .Club(club),
            ct
        );
}
