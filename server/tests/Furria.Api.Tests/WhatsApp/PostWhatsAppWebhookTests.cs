using System.Net;
using Furria.Application.Authorization;
using Furria.Application.WhatsApp;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Push.SubscribedDevices;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.WhatsApp;

public sealed class PostWhatsAppWebhookTests : IClassFixture<ApiTestFixture>
{
    private const string Admin = "admin";
    private const string Member = "member";

    private readonly ApiTestFixture _fixture;

    public PostWhatsAppWebhookTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateTimeOffset Now => _fixture.TimeProvider.GetUtcNow();

    [Fact]
    public async Task Should_PushOncePerDrop_When_TheSessionPassesThroughSeveralBrokenStates()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var adminsPhone = await SubscribedDeviceAsync(ctx, Admin, "whatsapp-states", ct);
        var client = _fixture.CreateClient();

        await DeliverAsync(client, SessionStatus("WORKING", Now), "states-1", ct);
        await DeliverAsync(client, SessionStatus("STARTING", Now.AddSeconds(1)), "states-2", ct);
        await DeliverAsync(client, SessionStatus("FAILED", Now.AddSeconds(2)), "states-3", ct);
        await DeliverAsync(client, SessionStatus("STOPPED", Now.AddSeconds(3)), "states-4", ct);
        await SettledAsync(ct);

        Assert.Single(PushesAt(_fixture, adminsPhone));
    }

    [Fact]
    public async Task Should_NotPush_When_AnOlderDropArrivesAfterTheSessionWorksAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var adminsPhone = await SubscribedDeviceAsync(ctx, Admin, "whatsapp-late", ct);
        var client = _fixture.CreateClient();

        await DeliverAsync(client, SessionStatus("WORKING", Now.AddSeconds(2)), "late-1", ct);
        await DeliverAsync(client, SessionStatus("FAILED", Now.AddSeconds(1)), "late-2", ct);
        await SettledAsync(ct);

        Assert.Empty(PushesAt(_fixture, adminsPhone));
    }

    [Fact]
    public async Task Should_RefuseTheDelivery_When_ItsSignatureDoesNotMatch()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var adminsPhone = await SubscribedDeviceAsync(ctx, Admin, "whatsapp-forged", ct);
        var client = _fixture.CreateClient();

        await DeliverAsync(client, SessionStatus("WORKING", Now), "forged-1", ct);
        var answer = await DeliverForgedAsync(
            client,
            SessionStatus("FAILED", Now.AddSeconds(1)),
            "forged-2",
            ct
        );
        await SettledAsync(ct);

        Assert.Equal(HttpStatusCode.Unauthorized, answer.StatusCode);
        Assert.Empty(PushesAt(_fixture, adminsPhone));
    }

    private async Task SettledAsync(CancellationToken ct)
    {
        await _fixture.WhatsAppInboxDrainedAsync(ct);
        await _fixture.PushesDrainedAsync(ct);
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount(Admin)
                            .AddMembership("admin-membership", Admin)
                            .AddAccount(Member)
                            .AddMembership("member-membership", Member)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "system",
                            "admin-system",
                            "System",
                            Admin,
                            [FurriaPermissions.SystemView]
                        )
                    ),
            ct
        );
}
