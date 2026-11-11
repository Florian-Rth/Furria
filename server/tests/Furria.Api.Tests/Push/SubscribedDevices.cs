using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.Push;

namespace Furria.Api.Tests.Push;

internal static class SubscribedDevices
{
    internal static async Task<string> SubscribedDeviceAsync(
        SeededContext ctx,
        string accountAlias,
        string deviceName,
        CancellationToken ct
    )
    {
        var device = $"https://fcm.googleapis.com/fcm/send/{deviceName}";
        var client = await ctx.Identity.ClientForAsync(accountAlias, ct);
        var response = await client.PUTAsync<PutMyPushSubscription, PutMyPushSubscriptionRequest>(
            new PutMyPushSubscriptionRequest
            {
                Endpoint = device,
                Keys = new PushSubscriptionKeysDto
                {
                    P256dh = PushDevices.FirstPublicKey,
                    Auth = PushDevices.AuthSecret,
                },
            }
        );
        response.EnsureSuccessStatusCode();

        return device;
    }

    internal static IReadOnlyList<JsonElement> PushesAt(ApiTestFixture fixture, string device) =>
        [
            .. fixture
                .PushService.ReceivedAt(device)
                .Select(push =>
                    push.PayloadFor(
                        PushDevices.FirstPublicKey,
                        PushDevices.FirstPrivateKey,
                        PushDevices.AuthSecret
                    )
                ),
        ];

    internal static string UrlOf(JsonElement push) => push.GetProperty("url").GetString() ?? "";
}
