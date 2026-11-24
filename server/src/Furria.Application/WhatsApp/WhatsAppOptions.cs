namespace Furria.Application.WhatsApp;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public const string DefaultSession = "default";

    private static readonly TimeSpan DefaultSendGap = TimeSpan.FromSeconds(4);
    private static readonly TimeSpan DefaultSendGapJitter = TimeSpan.FromSeconds(4);
    private static readonly TimeSpan DefaultReplyDelay = TimeSpan.FromSeconds(1);
    private static readonly TimeSpan DefaultReplyDelayJitter = TimeSpan.FromSeconds(1);

    public string BaseUrl { get; set; } = "";

    public string ApiKey { get; set; } = "";

    public string WebhookHmacKey { get; set; } = "";

    public string Session { get; set; } = DefaultSession;

    public TimeSpan SendGap { get; set; } = DefaultSendGap;

    public TimeSpan SendGapJitter { get; set; } = DefaultSendGapJitter;

    public TimeSpan ReplyDelay { get; set; } = DefaultReplyDelay;

    public TimeSpan ReplyDelayJitter { get; set; } = DefaultReplyDelayJitter;

    public bool IsSwitchedOff => BaseUrl.Length == 0;

    public bool IsConfigured =>
        Uri.TryCreate(BaseUrl, UriKind.Absolute, out _)
        && ApiKey.Length > 0
        && WebhookHmacKey.Length > 0
        && Session.Length > 0;
}
