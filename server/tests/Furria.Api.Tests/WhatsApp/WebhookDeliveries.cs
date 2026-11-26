using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Furria.Tests.Common.Fixtures;

namespace Furria.Api.Tests.WhatsApp;

internal static class WebhookDeliveries
{
    private const string Route = "/api/whatsapp/webhook";

    internal static Task<HttpResponseMessage> DeliverAsync(
        HttpClient client,
        string body,
        string requestId,
        CancellationToken ct
    ) => SendAsync(client, body, requestId, SignatureOf(body), ct);

    internal static Task<HttpResponseMessage> DeliverForgedAsync(
        HttpClient client,
        string body,
        string requestId,
        CancellationToken ct
    ) => SendAsync(client, body, requestId, SignatureOf(body + " "), ct);

    internal static string SessionStatus(string status, DateTimeOffset at) =>
        JsonSerializer.Serialize(
            new
            {
                id = $"evt_{Guid.NewGuid():N}",
                timestamp = at.ToUnixTimeMilliseconds(),
                @event = "session.status",
                session = ApiTestFixture.WhatsAppSession,
                engine = "GOWS",
                payload = new { status },
            }
        );

    internal static string GroupJoin(
        string groupChatId,
        string participantId,
        string? phoneId,
        DateTimeOffset at
    ) =>
        JsonSerializer.Serialize(
            new
            {
                id = $"evt_{Guid.NewGuid():N}",
                timestamp = at.ToUnixTimeMilliseconds(),
                @event = "group.v2.participants",
                session = ApiTestFixture.WhatsAppSession,
                engine = "GOWS",
                payload = new
                {
                    group = new { id = groupChatId },
                    type = "join",
                    timestamp = at.ToUnixTimeSeconds(),
                    participants = new[]
                    {
                        new
                        {
                            id = participantId,
                            pn = phoneId,
                            role = "participant",
                        },
                    },
                },
            }
        );

    internal static string PollVote(
        string pollMessageId,
        string voterId,
        DateTimeOffset at,
        params string[] selectedOptions
    ) =>
        JsonSerializer.Serialize(
            new
            {
                id = $"evt_{Guid.NewGuid():N}",
                timestamp = at.ToUnixTimeMilliseconds(),
                @event = "poll.vote",
                session = ApiTestFixture.WhatsAppSession,
                engine = "GOWS",
                payload = new
                {
                    vote = new
                    {
                        id = $"false_{voterId}_{Guid.NewGuid():N}",
                        from = "120363000000000001@g.us",
                        fromMe = false,
                        participant = voterId,
                        selectedOptions,
                        timestamp = at.ToUnixTimeSeconds(),
                    },
                    poll = new { id = pollMessageId, fromMe = true },
                },
            }
        );

    internal static string Message(
        string chatId,
        string text,
        DateTimeOffset at,
        bool hasMedia = false,
        string? participant = null
    ) =>
        JsonSerializer.Serialize(
            new
            {
                id = $"evt_{Guid.NewGuid():N}",
                timestamp = at.ToUnixTimeMilliseconds(),
                @event = "message",
                session = ApiTestFixture.WhatsAppSession,
                engine = "GOWS",
                payload = new
                {
                    id = $"false_{chatId}_{Guid.NewGuid():N}",
                    timestamp = at.ToUnixTimeSeconds(),
                    from = chatId,
                    fromMe = false,
                    participant,
                    body = text,
                    hasMedia,
                },
            }
        );

    private static async Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        string body,
        string requestId,
        string signature,
        CancellationToken ct
    )
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, Route)
        {
            Content = new StringContent(body, Encoding.UTF8),
        };
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        request.Headers.Add("X-Webhook-Request-Id", requestId);
        request.Headers.Add(
            "X-Webhook-Timestamp",
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString(CultureInfo.InvariantCulture)
        );
        request.Headers.Add("X-Webhook-Hmac", signature);
        request.Headers.Add("X-Webhook-Hmac-Algorithm", "sha512");

        return await client.SendAsync(request, ct);
    }

    private static string SignatureOf(string body) =>
        Convert.ToHexStringLower(
            HMACSHA512.HashData(
                Encoding.UTF8.GetBytes(ApiTestFixture.WhatsAppWebhookHmacKey),
                Encoding.UTF8.GetBytes(body)
            )
        );
}
