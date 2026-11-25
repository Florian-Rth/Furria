namespace Furria.Infrastructure.Assistant;

public sealed record VenueOccupancyFact(
    string Venue,
    ClubMomentFact From,
    ClubMomentFact Until,
    bool IsFree,
    IReadOnlyList<CalendarEntryFact> Entries,
    IReadOnlyList<UsualTrainingFact> UsualTrainings,
    int OtherBookings
);
