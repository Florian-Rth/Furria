namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppSession
{
    public const int NameLength = 64;

    public string Name { get; set; } = "";

    public WhatsAppSessionStatus Status { get; set; }

    public DateTimeOffset StatusAt { get; set; }

    public bool WasWorking { get; set; }
}
