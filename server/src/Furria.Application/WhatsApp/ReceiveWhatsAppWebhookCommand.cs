namespace Furria.Application.WhatsApp;

public sealed record ReceiveWhatsAppWebhookCommand
{
    public required string RequestId { get; init; }

    public required string Signature { get; init; }

    public required byte[] Body { get; init; }
}
