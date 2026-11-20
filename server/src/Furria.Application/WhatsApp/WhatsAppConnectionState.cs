namespace Furria.Application.WhatsApp;

public enum WhatsAppConnectionState
{
    Off = 1,
    Unreachable = 2,
    Stopped = 3,
    Starting = 4,
    ScanQrCode = 5,
    Working = 6,
    Failed = 7,
}
