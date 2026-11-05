using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.Push;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PostTestPushTests : IClassFixture<ApiTestFixture>
{
    private const string Delivered =
        "Push to device {PushSubscriptionId} at {PushServiceHost} was accepted with {StatusCode}";

    private readonly ApiTestFixture _fixture;

    public PostTestPushTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeliverAnEncryptedSignedPushToEveryDevice_When_AnAdminSendsATest()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var phone = Device("delivered-phone");
        var tablet = Device("delivered-tablet");
        await SubscribeAsync(ilka, phone);
        await SubscribeAsync(ilka, tablet);

        var (response, result) = await SendTestAsync(ilka);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new PushDeliveryDto
            {
                Delivered = 2,
                Forgotten = 0,
                Failed = 0,
            },
            result.Delivery
        );
        var push = Assert.Single(_fixture.PushService.ReceivedAt(phone));
        Assert.Single(_fixture.PushService.ReceivedAt(tablet));
        Assert.Equal("aes128gcm", push.ContentEncoding);
        Assert.True(int.Parse(push.TimeToLive) > 0);
        var claims = push.VerifiedVapidClaims(ApiTestFixture.VapidPublicKey);
        Assert.Equal("https://fcm.googleapis.com", claims.Audience);
        Assert.Equal(ApiTestFixture.ClubAppBaseUrl, claims.Subject);
        Assert.True(claims.ExpiresAt > _fixture.TimeProvider.GetUtcNow());
        Assert.True(claims.ExpiresAt <= _fixture.TimeProvider.GetUtcNow().AddHours(24));
        var payload = push.PayloadFor(
            PushDevices.FirstPublicKey,
            PushDevices.FirstPrivateKey,
            PushDevices.AuthSecret
        );
        Assert.Equal("/system", payload.GetProperty("url").GetString());
    }

    [Fact]
    public async Task Should_LogEachDeliveredPushWithItsDeviceAndPushService_When_AnAdminSendsATest()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var phone = Device("logged-phone");
        await SubscribeAsync(ilka, phone);
        var mark = _fixture.Logs.Mark();

        await SendTestAsync(ilka);

        var written = Assert.Single(_fixture.Logs.Written(Delivered, mark));
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal("fcm.googleapis.com", written.ScalarOf("PushServiceHost"));
        Assert.Equal((int)HttpStatusCode.Created, written.ScalarOf("StatusCode"));
    }

    [Fact]
    public async Task Should_ForgetTheDevice_When_ItsPushServiceSaysItIsGone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var expired = Device("gone-expired");
        var unknown = Device("gone-unknown");
        var living = Device("gone-living");
        _fixture.PushService.Answer(expired, HttpStatusCode.Gone);
        _fixture.PushService.Answer(unknown, HttpStatusCode.NotFound);
        await SubscribeAsync(ilka, expired);
        await SubscribeAsync(ilka, unknown);
        await SubscribeAsync(ilka, living);

        var (response, result) = await SendTestAsync(ilka);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new PushDeliveryDto
            {
                Delivered = 1,
                Forgotten = 2,
                Failed = 0,
            },
            result.Delivery
        );
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("ilka"))
            .ToHaveCount(1)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("ilka"))
            .ToHold(living, PushDevices.FirstPublicKey, PushDevices.AuthSecret)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.Forbidden)]
    public async Task Should_KeepTheDevice_When_ItsPushServiceFailsForAnotherReason(
        HttpStatusCode answer
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var phone = Device($"failing-{(int)answer}");
        _fixture.PushService.Answer(phone, answer);
        await SubscribeAsync(ilka, phone);

        var (response, result) = await SendTestAsync(ilka);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new PushDeliveryDto
            {
                Delivered = 0,
                Forgotten = 0,
                Failed = 1,
            },
            result.Delivery
        );
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("ilka"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_PushOnlyToTheSendersDevices_When_OthersHaveSubscribedToo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var bob = await ctx.Identity.ClientForAsync("bob", ct);
        var bobsPhone = Device("foreign-phone");
        await SubscribeAsync(bob, bobsPhone);

        var (response, result) = await SendTestAsync(ilka);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            new PushDeliveryDto
            {
                Delivered = 0,
                Forgotten = 0,
                Failed = 0,
            },
            result.Delivery
        );
        Assert.Empty(_fixture.PushService.ReceivedAt(bobsPhone));
    }

    private static string Device(string name) => $"https://fcm.googleapis.com/fcm/send/{name}";

    private static Task<HttpResponseMessage> SubscribeAsync(HttpClient client, string endpoint) =>
        client.PUTAsync<PutMyPushSubscription, PutMyPushSubscriptionRequest>(
            new PutMyPushSubscriptionRequest
            {
                Endpoint = endpoint,
                Keys = new PushSubscriptionKeysDto
                {
                    P256dh = PushDevices.FirstPublicKey,
                    Auth = PushDevices.AuthSecret,
                },
            }
        );

    private static Task<TestResult<PostTestPushResponse>> SendTestAsync(HttpClient client) =>
        client.POSTAsync<PostTestPush, PostTestPushResponse>();

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka").AddAccount("bob"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "technik",
                            "technik-holding",
                            "Technik",
                            "ilka",
                            FurriaPermissions.SystemView
                        )
                    ),
            ct
        );
}
