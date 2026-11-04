using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.Push;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class PutMyPushSubscriptionTests : IClassFixture<ApiTestFixture>
{
    private const string AndroidPhone = "https://fcm.googleapis.com/fcm/send/alice-pixel";
    private const string IPhone = "https://web.push.apple.com/QGuQyavXutnMDUpAWVxkAb";

    private readonly ApiTestFixture _fixture;

    public PutMyPushSubscriptionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreTheDevice_When_AMemberSubscribesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await SubscribeAsync(client, AndroidPhone, PushDevices.FirstPublicKey);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(1)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHold(AndroidPhone, PushDevices.FirstPublicKey, PushDevices.AuthSecret)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepEveryDevice_When_AMemberSubscribesASecondOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        await SubscribeAsync(client, AndroidPhone, PushDevices.FirstPublicKey);
        await SubscribeAsync(client, IPhone, PushDevices.SecondPublicKey);

        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetTheEarliestDevice_When_AMemberSubscribesMoreThanTen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var devices = Enumerable
            .Range(1, 11)
            .Select(number => $"https://fcm.googleapis.com/fcm/send/alice-device-{number}")
            .ToArray();

        foreach (var device in devices)
            await SubscribeAsync(client, device, PushDevices.FirstPublicKey);

        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(10)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHold(devices[^1], PushDevices.FirstPublicKey, PushDevices.AuthSecret)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToNotHold(devices[0])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheDevice_When_ItsFieldsAreNull()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await client.PutAsync(
            "/api/push/subscription",
            new StringContent(
                """{"endpoint":null,"keys":{"p256dh":null,"auth":null}}""",
                System.Text.Encoding.UTF8,
                "application/json"
            ),
            ct
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_RenewTheKeys_When_TheSameDeviceSubscribesAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        await SubscribeAsync(client, AndroidPhone, PushDevices.FirstPublicKey);

        var response = await SubscribeAsync(client, AndroidPhone, PushDevices.SecondPublicKey);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(1)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHold(AndroidPhone, PushDevices.SecondPublicKey, PushDevices.AuthSecret)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheDevice_When_AnotherAccountSignsInOnItAndSubscribes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        var bob = await ctx.Identity.ClientForAsync("bob", ct);
        await SubscribeAsync(alice, AndroidPhone, PushDevices.FirstPublicKey);

        var response = await SubscribeAsync(bob, AndroidPhone, PushDevices.FirstPublicKey);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(0)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("bob"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("https://push.example.com/send/alice")]
    [InlineData("http://fcm.googleapis.com/fcm/send/alice")]
    [InlineData("https://fcm.googleapis.com:8443/fcm/send/alice")]
    [InlineData("https://fcm.googleapis.com.example.com/fcm/send/alice")]
    [InlineData("https://10.10.20.12/api/health")]
    public async Task Should_RefuseTheDevice_When_ItsEndpointIsNoKnownPushService(string endpoint)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await SubscribeAsync(client, endpoint, PushDevices.FirstPublicKey);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("BCVxsr7N_eNgVRqvHtD0zTZsEc6", PushDevices.AuthSecret)]
    [InlineData(
        "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw5",
        PushDevices.AuthSecret
    )]
    [InlineData(PushDevices.FirstPublicKey, "BTBZMqHH6r4T")]
    public async Task Should_RefuseTheDevice_When_ItsKeysAreNoWebPushKeys(
        string publicKey,
        string authSecret
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await SubscribeAsync(client, AndroidPhone, publicKey, authSecret);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static async Task<HttpResponseMessage> SubscribeAsync(
        HttpClient client,
        string endpoint,
        string publicKey,
        string authSecret = PushDevices.AuthSecret
    )
    {
        return await client.PUTAsync<PutMyPushSubscription, PutMyPushSubscriptionRequest>(
            new PutMyPushSubscriptionRequest
            {
                Endpoint = endpoint,
                Keys = new PushSubscriptionKeysDto { P256dh = publicKey, Auth = authSecret },
            }
        );
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice").AddAccount("bob")),
            ct
        );
}
