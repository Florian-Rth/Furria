namespace Furria.Infrastructure.WhatsApp;

public enum WhatsAppSendOutcome
{
    Idle = 1,
    Sent = 2,
    Failed = 3,
    RateLimited = 4,
}
