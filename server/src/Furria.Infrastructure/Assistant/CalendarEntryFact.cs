namespace Furria.Infrastructure.Assistant;

public sealed record CalendarEntryFact(
    int CalendarEntryId,
    string Title,
    string Kind,
    ClubMomentFact Starts,
    ClubMomentFact? Ends,
    string? Venue,
    string Organiser,
    string Audience,
    bool IsRunningNow,
    IReadOnlyList<string> AddOns,
    string Link
);
