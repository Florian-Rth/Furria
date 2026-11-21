namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppOperations
{
    public static readonly IReadOnlyList<WhatsAppOperation> Targeting =
    [
        WhatsAppOperation.EditText,
        WhatsAppOperation.Reply,
        WhatsAppOperation.Delete,
    ];
}
