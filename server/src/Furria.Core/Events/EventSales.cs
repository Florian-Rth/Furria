using System.Diagnostics.Contracts;

namespace Furria.Core.Events;

public static class EventSales
{
    [Pure]
    public static bool HasPresaleBegun(DateTimeOffset? presaleStartsAt, DateTimeOffset now) =>
        presaleStartsAt is { } startsAt && startsAt <= now;

    [Pure]
    public static EventSalesStatus StatusOf(
        DateTimeOffset? presaleStartsAt,
        TicketAvailability availability,
        bool isCancelled,
        DateTimeOffset now
    ) =>
        isCancelled ? EventSalesStatus.Cancelled
        : presaleStartsAt is null ? EventSalesStatus.Announced
        : !HasPresaleBegun(presaleStartsAt, now) ? EventSalesStatus.PresaleScheduled
        : StatusOf(availability);

    [Pure]
    private static EventSalesStatus StatusOf(TicketAvailability availability) =>
        availability switch
        {
            TicketAvailability.Available => EventSalesStatus.Available,
            TicketAvailability.FewLeft => EventSalesStatus.FewLeft,
            TicketAvailability.SoldOut => EventSalesStatus.SoldOut,
            _ => throw new ArgumentOutOfRangeException(
                nameof(availability),
                availability,
                "No sales status is defined for this ticket availability."
            ),
        };
}
