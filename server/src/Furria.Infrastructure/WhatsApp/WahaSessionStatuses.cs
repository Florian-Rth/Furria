using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaSessionStatuses
{
    private static readonly IReadOnlyDictionary<string, WhatsAppSessionStatus> ByWireName =
        new Dictionary<string, WhatsAppSessionStatus>(StringComparer.Ordinal)
        {
            ["STOPPED"] = WhatsAppSessionStatus.Stopped,
            ["STARTING"] = WhatsAppSessionStatus.Starting,
            ["SCAN_QR_CODE"] = WhatsAppSessionStatus.ScanQrCode,
            ["WORKING"] = WhatsAppSessionStatus.Working,
            ["FAILED"] = WhatsAppSessionStatus.Failed,
        };

    [Pure]
    public static WhatsAppSessionStatus? Parse(string? wireName) =>
        wireName is not null && ByWireName.TryGetValue(wireName, out var status) ? status : null;

    [Pure]
    public static bool IsBroken(WhatsAppSessionStatus status) =>
        status
            is WhatsAppSessionStatus.Stopped
                or WhatsAppSessionStatus.ScanQrCode
                or WhatsAppSessionStatus.Failed;
}
