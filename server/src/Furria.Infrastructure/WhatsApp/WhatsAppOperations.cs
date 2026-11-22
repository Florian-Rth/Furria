using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppOperations
{
    public static readonly IReadOnlyList<WhatsAppOperation> Targeting =
    [
        WhatsAppOperation.EditText,
        WhatsAppOperation.Reply,
        WhatsAppOperation.Delete,
    ];

    [Pure]
    public static bool IsKeptAsPost(WhatsAppOperation operation) =>
        operation != WhatsAppOperation.DirectText && !Targeting.Contains(operation);
}
