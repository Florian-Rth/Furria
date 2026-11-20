namespace Furria.Infrastructure.WhatsApp;

public enum WhatsAppSessionStatus
{
    Stopped = 1,
    Starting = 2,
    ScanQrCode = 3,
    Working = 4,
    Failed = 5,
}
