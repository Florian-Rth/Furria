using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal static class OpeningHoursOrder
{
    [Pure]
    internal static IReadOnlyList<VenueOpeningSlotDetails> InWeekOrder(
        IEnumerable<VenueOpeningSlotDetails> slots
    ) => [.. slots.OrderBy(slot => ClubWeek.PositionOf(slot.Weekday)).ThenBy(slot => slot.Opens)];
}
