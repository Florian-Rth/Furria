using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppSessionTransition(bool WasWorking, bool Drops)
{
    [Pure]
    public static WhatsAppSessionTransition Of(bool wasWorking, WhatsAppSessionStatus status) =>
        status switch
        {
            WhatsAppSessionStatus.Working => new(WasWorking: true, Drops: false),
            _ when WahaSessionStatuses.IsBroken(status) => new(
                WasWorking: false,
                Drops: wasWorking
            ),
            _ => new(wasWorking, Drops: false),
        };
}
