namespace Furria.Infrastructure.Assistant;

public sealed record OpenAnswerFact(
    string Title,
    ClubMomentFact? Starts,
    IReadOnlyList<string> Open,
    int? CalendarEntryId,
    int? AnnouncementId,
    string Link
);
