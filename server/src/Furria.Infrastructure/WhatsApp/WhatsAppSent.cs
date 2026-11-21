using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppSent(string? MessageId, WahaAddOutcome? AddOutcome)
{
    [Pure]
    public static WhatsAppSent Message(string? messageId) => new(messageId, null);

    [Pure]
    public static WhatsAppSent Add(WahaAddOutcome outcome) => new(null, outcome);
}
