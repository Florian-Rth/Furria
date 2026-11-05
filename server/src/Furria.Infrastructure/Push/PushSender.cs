using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text.Json;
using Furria.Application.Push;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Push;

public sealed class PushSender
{
    public const string HttpClientName = "web-push";

    private const string VapidScheme = "vapid";
    private const string EncryptedContentEncoding = "aes128gcm";

    private static readonly JsonSerializerOptions PayloadJson = new(JsonSerializerDefaults.Web);

    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(10);

    private readonly AppDbContext _dbContext;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly PushOptions _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<PushSender> _logger;

    public PushSender(
        AppDbContext dbContext,
        IHttpClientFactory httpClientFactory,
        IOptions<PushOptions> options,
        TimeProvider timeProvider,
        ILogger<PushSender> logger
    )
    {
        _dbContext = dbContext;
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<PushDeliveryDetails> SendAsync(
        int accountId,
        PushMessage message,
        CancellationToken ct
    )
    {
        var devices = await _dbContext
            .PushSubscriptions.AsNoTracking()
            .Where(subscription => subscription.AccountId == accountId)
            .OrderBy(subscription => subscription.Id)
            .ToListAsync(ct);

        var outcomes = await Task.WhenAll(
            devices.Select(async device =>
                (Device: device, Outcome: await DeliverAsync(device, message, ct))
            )
        );

        await ForgetAsync(GoneDevices(outcomes), ct);

        return DeliveryOf([.. outcomes.Select(outcome => outcome.Outcome)]);
    }

    [Pure]
    private static PushSubscription[] GoneDevices(
        IEnumerable<(PushSubscription Device, PushOutcome Outcome)> outcomes
    ) => [.. outcomes.Where(pair => pair.Outcome == PushOutcome.Gone).Select(pair => pair.Device)];

    [Pure]
    private static PushDeliveryDetails DeliveryOf(IReadOnlyCollection<PushOutcome> outcomes) =>
        new()
        {
            Delivered = outcomes.Count(outcome => outcome == PushOutcome.Delivered),
            Forgotten = outcomes.Count(outcome => outcome == PushOutcome.Gone),
            Failed = outcomes.Count(outcome => outcome == PushOutcome.Failed),
        };

    [Pure]
    private static PushOutcome OutcomeOf(HttpStatusCode status) =>
        status switch
        {
            HttpStatusCode.NotFound or HttpStatusCode.Gone => PushOutcome.Gone,
            >= HttpStatusCode.OK and < HttpStatusCode.MultipleChoices => PushOutcome.Delivered,
            _ => PushOutcome.Failed,
        };

    private async Task<PushOutcome> DeliverAsync(
        PushSubscription device,
        PushMessage message,
        CancellationToken ct
    )
    {
        try
        {
            var endpoint = new Uri(device.Endpoint);
            using var request = RequestFor(endpoint, device, message);
            using var response = await _httpClientFactory
                .CreateClient(HttpClientName)
                .SendAsync(request, ct);

            var outcome = OutcomeOf(response.StatusCode);
            LogOutcome(outcome, device.Id, endpoint.Host, response.StatusCode);

            return outcome;
        }
        catch (Exception exception) when (!ct.IsCancellationRequested)
        {
            _logger.LogWarning(
                exception,
                "Push to device {PushSubscriptionId} could not be sent",
                device.Id
            );
            return PushOutcome.Failed;
        }
    }

    private void LogOutcome(
        PushOutcome outcome,
        int deviceId,
        string pushServiceHost,
        HttpStatusCode status
    )
    {
        switch (outcome)
        {
            case PushOutcome.Delivered:
                _logger.LogInformation(
                    "Push to device {PushSubscriptionId} at {PushServiceHost} was accepted with {StatusCode}",
                    deviceId,
                    pushServiceHost,
                    (int)status
                );
                break;
            case PushOutcome.Gone:
                _logger.LogInformation(
                    "Push device {PushSubscriptionId} at {PushServiceHost} is gone ({StatusCode}) and is forgotten",
                    deviceId,
                    pushServiceHost,
                    (int)status
                );
                break;
            case PushOutcome.Failed:
                _logger.LogWarning(
                    "Push to device {PushSubscriptionId} at {PushServiceHost} was refused with {StatusCode}",
                    deviceId,
                    pushServiceHost,
                    (int)status
                );
                break;
        }
    }

    private HttpRequestMessage RequestFor(
        Uri endpoint,
        PushSubscription device,
        PushMessage message
    )
    {
        var content = new ByteArrayContent(EncryptedPayloadFor(device, message));
        content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Headers.ContentEncoding.Add(EncryptedContentEncoding);

        var request = new HttpRequestMessage(HttpMethod.Post, endpoint) { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue(
            VapidScheme,
            $"t={SignedTokenFor(endpoint)}, k={_options.VapidPublicKey}"
        );
        request.Headers.Add(
            "TTL",
            ((int)message.TimeToLive.TotalSeconds).ToString(CultureInfo.InvariantCulture)
        );

        return request;
    }

    private byte[] EncryptedPayloadFor(PushSubscription device, PushMessage message)
    {
        using var sender = ECDiffieHellman.Create(ECCurve.NamedCurves.nistP256);
        var plaintext = JsonSerializer.SerializeToUtf8Bytes(
            new PushPayload(message.Title, message.Body, message.Url, message.Tag),
            PayloadJson
        );

        return WebPushPayload.Encrypt(
            plaintext,
            new PushReceiverKeys(
                Base64Url.DecodeFromChars(device.PublicKey),
                Base64Url.DecodeFromChars(device.AuthSecret)
            ),
            sender,
            RandomNumberGenerator.GetBytes(WebPushPayload.SaltLength)
        );
    }

    private string SignedTokenFor(Uri endpoint)
    {
        using var signer = ECDsa.Create(
            PushKeys.ParametersOf(
                Base64Url.DecodeFromChars(_options.VapidPublicKey),
                Base64Url.DecodeFromChars(_options.VapidPrivateKey)
            )
        );

        return VapidToken.For(
            VapidToken.AudienceOf(endpoint),
            _options.Subject,
            _timeProvider.GetUtcNow(),
            signer
        );
    }

    private async Task ForgetAsync(PushSubscription[] goneDevices, CancellationToken ct)
    {
        foreach (var device in goneDevices)
            await _dbContext
                .PushSubscriptions.Where(subscription =>
                    subscription.Id == device.Id
                    && subscription.PublicKey == device.PublicKey
                    && subscription.AuthSecret == device.AuthSecret
                )
                .ExecuteDeleteAsync(ct);
    }

    private sealed record PushPayload(string Title, string Body, string Url, string Tag);

    private enum PushOutcome
    {
        Delivered,
        Gone,
        Failed,
    }
}
