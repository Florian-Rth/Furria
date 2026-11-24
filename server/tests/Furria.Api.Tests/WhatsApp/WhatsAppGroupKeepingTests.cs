using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Endpoints.Start;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Infrastructure.WhatsApp;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WhatsApp;
using Xunit;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppGroupKeepingTests : IClassFixture<ApiTestFixture>
{
    private const string ClubChatId = "120363000000000001@g.us";
    private const string AlicesId = "491701234567@c.us";
    private const string BeasId = "491702222222@c.us";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public WhatsAppGroupKeepingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AddOnlyActiveMembersWhoConsented_When_GroupKeepingIsOn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await ConsentAsync(ctx, "alice", ct);
        await ConsentOnHerWordAsync(ctx, "carla", ct);
        await SwitchKeepingAsync(ctx, true, ct);

        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        var add = Assert.Single(_fixture.Waha.Sent);
        Assert.Equal(("add", ClubChatId, AlicesId), (add.Kind, add.ChatId, add.Text));
    }

    [Fact]
    public async Task Should_NeverAddHerAgain_When_SheLeftTheGroupAfterBeingAdded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await ConsentAsync(ctx, "alice", ct);
        await SwitchKeepingAsync(ctx, true, ct);
        await _fixture.StageWhatsAppGroupAddsAsync(ct);
        await _fixture.WhatsAppOutboxDrainedAsync(ct);
        _fixture.Waha.Unseat(ClubChatId, AlicesId);

        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
        Assert.Single(_fixture.Waha.Sent);
    }

    [Fact]
    public async Task Should_StageAFewAddsAtATime_When_ManyConsentAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        foreach (var login in new[] { "alice", "bea", "dora", "emil" })
            await ConsentAsync(ctx, login, ct);
        await SwitchKeepingAsync(ctx, true, ct);

        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        var staged = await _fixture.WhatsAppOutboxAsync(ct);
        Assert.Equal(WhatsAppKeepingPlan.MostAddsPerPass, staged.Count);
        Assert.All(
            staged,
            operation => Assert.Equal(WhatsAppOperation.AddParticipant, operation.Operation)
        );
    }

    [Fact]
    public async Task Should_NotAddHer_When_SheJoinedHerselfBeforeConsenting()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SwitchKeepingAsync(ctx, true, ct);
        await DeliverAsync(
            GroupJoin(ClubChatId, BeasId, null, _fixture.TimeProvider.GetUtcNow()),
            ct
        );
        await ConsentAsync(ctx, "bea", ct);

        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
    }

    [Fact]
    public async Task Should_NotRetryHerAdd_When_ItFailedForGood()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await HoldTheSessionAsync(ct);
        await ConsentAsync(ctx, "alice", ct);
        await SwitchKeepingAsync(ctx, true, ct);
        await _fixture.StageWhatsAppGroupAddsAsync(ct);
        await _fixture.FailWhatsAppOutboxForGoodAsync(ct);

        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        Assert.Single(await _fixture.WhatsAppOutboxAsync(ct));
    }

    [Fact]
    public async Task Should_DropHerWaitingAdd_When_SheWithdrawsHerConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await HoldTheSessionAsync(ct);
        await ConsentAsync(ctx, "alice", ct);
        await SwitchKeepingAsync(ctx, true, ct);
        await _fixture.StageWhatsAppGroupAddsAsync(ct);

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        await client.PUTAsync<PutMyClubGroupConsent, PutMyClubGroupConsentRequest>(
            new() { ClubGroupConsent = false }
        );

        Assert.Empty(await _fixture.WhatsAppOutboxAsync(ct));
    }

    private Task HoldTheSessionAsync(CancellationToken ct) =>
        DeliverAsync(SessionStatus("STOPPED", _fixture.TimeProvider.GetUtcNow()), ct);

    private async Task DeliverAsync(string body, CancellationToken ct)
    {
        var delivered = await WebhookDeliveries.DeliverAsync(
            _fixture.CreateClient(),
            body,
            $"join-{Guid.NewGuid():N}",
            ct
        );
        Assert.Equal(HttpStatusCode.OK, delivered.StatusCode);
        await _fixture.WhatsAppInboxDrainedAsync(ct);
    }

    private static async Task ConsentAsync(SeededContext ctx, string login, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync(login, ct);
        var response = await client.PUTAsync<PutMyClubGroupConsent, PutMyClubGroupConsentRequest>(
            new() { ClubGroupConsent = true }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static async Task ConsentOnHerWordAsync(
        SeededContext ctx,
        string person,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<
            PutPersonClubGroupConsent,
            PutPersonClubGroupConsentRequest
        >(new() { PersonId = ctx.Identity.People.IdOf(person), ClubGroupConsent = true });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static async Task SwitchKeepingAsync(
        SeededContext ctx,
        bool keepsMembers,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<
            PutWhatsAppGroupKeeping,
            PutWhatsAppGroupKeepingRequest
        >(new() { KeepsMembers = keepsMembers });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private async Task<SeededContext> BuildClubAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact("alice", phone: "0170 1234567")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                        .AddPerson("bea", "Bea", "Beifall")
                        .AddPersonContact("bea", phone: "+49 170 2222222")
                        .AddAccount("bea")
                        .AddMembership("bea-first", "bea", JoinedIn2017)
                        .AddPerson("carla", "Carla", "Gast")
                        .AddPersonContact("carla", phone: "0170 5555555")
                        .AddPerson("dora", "Dora", "Drei")
                        .AddPersonContact("dora", phone: "0170 3333333")
                        .AddAccount("dora")
                        .AddMembership("dora-first", "dora", JoinedIn2017)
                        .AddPerson("emil", "Emil", "Vier")
                        .AddPersonContact("emil", phone: "0170 4444444")
                        .AddAccount("emil")
                        .AddMembership("emil-first", "emil", JoinedIn2017)
                ),
            ct
        );
        await _fixture.LinkClubWhatsAppGroupAsync(ClubChatId, ct);
        return ctx;
    }
}
