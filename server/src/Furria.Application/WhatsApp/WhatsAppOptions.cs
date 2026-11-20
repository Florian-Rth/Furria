namespace Furria.Application.WhatsApp;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public const string DefaultSession = "default";

    public string BaseUrl { get; set; } = "";

    public string ApiKey { get; set; } = "";

    public string WebhookHmacKey { get; set; } = "";

    public string Session { get; set; } = DefaultSession;

    public bool IsSwitchedOff => BaseUrl.Length == 0;

    public bool IsConfigured =>
        Uri.TryCreate(BaseUrl, UriKind.Absolute, out _)
        && ApiKey.Length > 0
        && WebhookHmacKey.Length > 0
        && Session.Length > 0;
}
