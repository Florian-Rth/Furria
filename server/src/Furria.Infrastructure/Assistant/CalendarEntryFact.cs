namespace Furria.Infrastructure.Assistant;

public sealed record CalendarEntryFact(
    string Title,
    string Kind,
    ClubMomentFact Starts,
    ClubMomentFact? Ends,
    string? Venue,
    string Organiser,
    string Audience,
    bool IsRunningNow,
    string Link
);
