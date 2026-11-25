namespace Furria.Infrastructure.Assistant;

public sealed record EventFact(
    int EventId,
    string Title,
    ClubMomentFact Starts,
    ClubMomentFact? Ends,
    string? DoorsOpen,
    string Venue,
    string Address,
    string Teaser,
    string? AgeHint,
    string? Price,
    string Tickets,
    ClubMomentFact? PresaleStarts,
    IReadOnlyList<PresalePlaceFact> PresalePlaces,
    string Link
);
