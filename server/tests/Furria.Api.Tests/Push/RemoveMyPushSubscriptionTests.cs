using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.Push;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class RemoveMyPushSubscriptionTests : IClassFixture<ApiTestFixture>
{
    private const string AlicesPhone = "https://fcm.googleapis.com/fcm/send/alice-pixel";
    private const string AlicesTablet = "https://fcm.googleapis.com/fcm/send/alice-tablet";
    private const string BobsPhone = "https://web.push.apple.com/bob-iphone";

    private readonly ApiTestFixture _fixture;

    public RemoveMyPushSubscriptionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ForgetOnlyThatDevice_When_AMemberUnsubscribesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        await SubscribeAsync(alice, AlicesPhone);
        await SubscribeAsync(alice, AlicesTablet);

        var response = await UnsubscribeAsync(alice, AlicesPhone);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveCount(1)
            .PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("alice"))
            .ToHold(AlicesTablet, PushDevices.FirstPublicKey, PushDevices.AuthSecret)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheDevice_When_ItBelongsToAnotherAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        var bob = await ctx.Identity.ClientForAsync("bob", ct);
        await SubscribeAsync(bob, BobsPhone);

        var response = await UnsubscribeAsync(alice, BobsPhone);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.PushSubscriptionsOfAccount(ctx.Identity.Accounts.IdOf("bob"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

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

    private static Task<HttpResponseMessage> UnsubscribeAsync(HttpClient client, string endpoint) =>
        client.POSTAsync<RemoveMyPushSubscription, RemoveMyPushSubscriptionRequest>(
            new RemoveMyPushSubscriptionRequest { Endpoint = endpoint }
        );

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice").AddAccount("bob")),
            ct
        );
}
