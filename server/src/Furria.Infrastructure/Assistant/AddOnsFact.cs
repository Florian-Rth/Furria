namespace Furria.Infrastructure.Assistant;

public sealed record AddOnsFact(
    string Title,
    ClubMomentFact? Starts,
    string Link,
    bool YouMayAnswer,
    AttendanceFact? Attendance,
    IReadOnlyList<string> ParticipatingGroups,
    IReadOnlyList<PollFact> Polls,
    IReadOnlyList<SignUpListFact> SignUpLists,
    IReadOnlyList<DayScheduleFact> DaySchedules
);
