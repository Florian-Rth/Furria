using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Core.Assistant;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.Assistant;

public sealed class ClubAssistantReceptionTests : IClassFixture<ApiTestFixture>
{
    private const string AlicesChatId = "491701234567@c.us";
    private const string CarlasChatId = "491705555555@c.us";
    private const string StrangersChatId = "491609999999@c.us";
    private const string ClubGroupChatId = "120363000000000001@g.us";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private readonly ApiTestFixture _fixture;

    public ClubAssistantReceptionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset Now => _fixture.TimeProvider.GetUtcNow();

    [Fact]
    public async Task Should_KeepTheQuestion_When_AMemberWritesPrivately()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(ct, Message(AlicesChatId, "Hat heute jemand Training?", Now));

        var question = Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct));
        Assert.Equal(
            (ctx.Identity.People.IdOf("alice"), AlicesChatId, "Hat heute jemand Training?"),
            (question.PersonId, question.ChatId, question.Text)
        );
        Assert.Empty(_fixture.Waha.Sent);
    }

    [Fact]
    public async Task Should_ReadQuickMessagesAsOneQuestion_When_TheyFollowWithinSeconds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(
            ct,
            Message(AlicesChatId, "Ist der Vereinsraum", Now.AddSeconds(-4)),
            Message(AlicesChatId, "Samstag um 14 Uhr frei?", Now)
        );

        var question = Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct));
        Assert.Equal("Ist der Vereinsraum\nSamstag um 14 Uhr frei?", question.Text);
    }

    [Fact]
    public async Task Should_StartANewQuestion_When_TheNextMessageComesLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(
            ct,
            Message(AlicesChatId, "Wann ist Training?", Now.AddMinutes(-5)),
            Message(AlicesChatId, "Und wo?", Now)
        );

        Assert.Equal(
            ["Wann ist Training?", "Und wo?"],
            (await _fixture.ClubAssistantQuestionsAsync(ct)).Select(question => question.Text)
        );
    }

    [Fact]
    public async Task Should_TellAnUnknownSenderOnceADay_When_NoMemberCarriesHerNumber()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(
            ct,
            Message(StrangersChatId, "Hallo?", Now.AddMinutes(-3)),
            Message(StrangersChatId, "Hallo??", Now)
        );

        var told = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal((StrangersChatId, ClubAssistantLines.UnknownSender), (told.ChatId, told.Text));
        Assert.Contains(StrangersChatId, _fixture.Waha.TypedIn);
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_TreatHerAsUnknown_When_SheIsNoLongerAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(ct, Message(CarlasChatId, "Wann ist Training?", Now));

        var told = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal((CarlasChatId, ClubAssistantLines.UnknownSender), (told.ChatId, told.Text));
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_StaySilent_When_SheWritesInAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(
            ct,
            Message(ClubGroupChatId, "@Furria wann ist Training?", Now, participant: AlicesChatId)
        );

        Assert.Empty(_fixture.Waha.Sent);
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_AskHerToType_When_SheSendsAVoiceMessage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);

        await ReceiveAsync(ct, Message(AlicesChatId, "", Now, hasMedia: true));

        var told = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal(AlicesChatId, told.ChatId);
        Assert.Contains("Tipp mir deine Frage", told.Text);
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_SayItPauses_When_TheAssistantIsSwitchedOff()
    {
        var ct = TestContext.Current.CancellationToken;
        await BuildClubAsync(ct);

        await ReceiveAsync(ct, Message(AlicesChatId, "Wann ist Training?", Now));

        var told = Assert.Single(_fixture.Waha.Sent);
        Assert.Contains("macht gerade Pause", told.Text);
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_SayTomorrowAgain_When_HerQuestionsForTheDayAreUsedUp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 1, ct);

        await ReceiveAsync(
            ct,
            Message(AlicesChatId, "Wann ist Training?", Now.AddMinutes(-5)),
            Message(AlicesChatId, "Und wo?", Now)
        );

        Assert.Contains("Morgen gern wieder", _fixture.Waha.Sent[^1].Text);
        Assert.Single(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_SayTheMonthIsDone_When_TheBudgetIsUsedUp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);
        await _fixture.BookClubAssistantCallAsync(new(0, 0, 5_000_000), ct);

        await ReceiveAsync(ct, Message(AlicesChatId, "Wann ist Training?", Now));

        var told = Assert.Single(_fixture.Waha.Sent);
        Assert.Contains("Fass leer", told.Text);
        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    [Fact]
    public async Task Should_ForgetTheConversation_When_ItIsOlderThanSevenDays()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchOnAsync(ctx, 30, ct);
        await ReceiveAsync(ct, Message(AlicesChatId, "Wann ist Training?", Now));

        _fixture.TimeProvider.SetUtcNow(
            Now + ClubAssistantConversation.KeptFor + TimeSpan.FromHours(1)
        );
        await _fixture.PurgeClubAssistantConversationsAsync(ct);

        Assert.Empty(await _fixture.ClubAssistantQuestionsAsync(ct));
    }

    private async Task ReceiveAsync(CancellationToken ct, params string[] bodies)
    {
        var client = _fixture.CreateClient();
        foreach (var body in bodies)
        {
            var received = await DeliverAsync(client, body, $"message-{Guid.NewGuid():N}", ct);
            Assert.Equal(HttpStatusCode.OK, received.StatusCode);
            await _fixture.WhatsAppInboxDrainedAsync(ct);
            await _fixture.ClubAssistantAnsweredAsync(ct);
        }

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
    }

    private static async Task SwitchOnAsync(
        SeededContext ctx,
        int questionsPerPersonPerDay,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAssistant, PutClubAssistantRequest>(
            new()
            {
                IsEnabled = true,
                MonthlyBudgetEuros = 10m,
                QuestionsPerPersonPerDay = questionsPerPersonPerDay,
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact("alice", phone: "0170 1234567")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                        .AddPerson("carla", "Carla", "Ehemalig")
                        .AddPersonContact("carla", phone: "0170 5555555")
                ),
            ct
        );
}
