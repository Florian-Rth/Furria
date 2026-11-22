using FastEndpoints;
using Furria.Api.Results;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PostWhatsAppWebhook : EndpointWithoutRequest
{
    private const int LargestBody = 256 * 1024;
    private const int ChunkLength = 16 * 1024;
    private const string RequestIdHeader = "X-Webhook-Request-Id";
    private const string SignatureHeader = "X-Webhook-Hmac";

    private readonly WhatsAppInbox _inbox;

    public PostWhatsAppWebhook(WhatsAppInbox inbox)
    {
        _inbox = inbox;
    }

    public override void Configure()
    {
        Post("whatsapp/webhook");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var body = await BodyWithinLimitAsync(ct);
        if (body is null)
        {
            await Send.ResultAsync(TypedResults.StatusCode(StatusCodes.Status413PayloadTooLarge));
            return;
        }

        var received = await _inbox.ReceiveAsync(
            new ReceiveWhatsAppWebhookCommand
            {
                RequestId = HttpContext.Request.Headers[RequestIdHeader].ToString(),
                Signature = HttpContext.Request.Headers[SignatureHeader].ToString(),
                Body = body,
            },
            ct
        );
        if (!received.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(received.Error, ct);
            return;
        }

        await Send.OkAsync(cancellation: ct);
    }

    private async Task<byte[]?> BodyWithinLimitAsync(CancellationToken ct)
    {
        if (HttpContext.Request.ContentLength > LargestBody)
            return null;

        using var buffer = new MemoryStream();
        var chunk = new byte[ChunkLength];
        int read;
        while ((read = await HttpContext.Request.Body.ReadAsync(chunk, ct)) > 0)
        {
            if (buffer.Length + read > LargestBody)
                return null;
            buffer.Write(chunk, 0, read);
        }

        return buffer.ToArray();
    }
}
