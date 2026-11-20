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
    public async Task Should_PushTheAdmins_When_TheSessionDrops()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var adminsPhone = await SubscribedDeviceAsync(ctx, Admin, "whatsapp-admin", ct);
        var membersPhone = await SubscribedDeviceAsync(ctx, Member, "whatsapp-member", ct);
        var client = _fixture.CreateClient();

        await DeliverAsync(client, SessionStatus("WORKING", Now), "drop-1", ct);
        var answer = await DeliverAsync(
            client,
            SessionStatus("FAILED", Now.AddSeconds(1)),
            "drop-2",
            ct
        );
        await SettledAsync(ct);

        Assert.Equal(HttpStatusCode.OK, answer.StatusCode);
        var push = Assert.Single(PushesAt(_fixture, adminsPhone));
        Assert.Equal("/manage/system/whatsapp", UrlOf(push));
        Assert.Empty(PushesAt(_fixture, membersPhone));
    }

    [Fact]
    public async Task Should_PushOnce_When_TheSameDeliveryArrivesTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var adminsPhone = await SubscribedDeviceAsync(ctx, Admin, "whatsapp-twice", ct);
        var client = _fixture.CreateClient();
        var dropped = SessionStatus("SCAN_QR_CODE", Now.AddSeconds(1));

        await DeliverAsync(client, SessionStatus("WORKING", Now), "twice-1", ct);
        await DeliverAsync(client, dropped, "twice-2", ct);
        var repeated = await DeliverAsync(client, dropped, "twice-2", ct);
        await SettledAsync(ct);

        Assert.Equal(HttpStatusCode.OK, repeated.StatusCode);
        Assert.Single(PushesAt(_fixture, adminsPhone));
    }

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

    [Fact]
    public async Task Should_RefuseEveryDelivery_When_WhatsAppIsNotSetUp()
    {
        var ct = TestContext.Current.CancellationToken;
        await BuildAsync(ct);
        var client = _fixture
            .HostWithSettings(
                new Dictionary<string, string>
                {
                    [$"{WhatsAppOptions.SectionName}:{nameof(WhatsAppOptions.BaseUrl)}"] = "",
                }
            )
            .CreateClient();

        var answer = await DeliverAsync(client, SessionStatus("WORKING", Now), "off-1", ct);

        Assert.Equal(HttpStatusCode.NotFound, answer.StatusCode);
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
