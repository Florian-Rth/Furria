using System.Diagnostics.Contracts;

namespace Furria.Core.Events;

public static class TicketRequestWindow
{
    [Pure]
    public static bool IsOpen(
        EventSalesStatus status,
        DateTimeOffset startsAt,
        DateTimeOffset now
    ) => status is EventSalesStatus.Available or EventSalesStatus.FewLeft && startsAt > now;
}
