namespace Furria.Core.Club;

public sealed record CalendarEntrySlot(
    DateTimeOffset StartsAt,
    DateTimeOffset? EndsAt,
    int? VenueId
);
