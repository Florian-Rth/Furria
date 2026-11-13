namespace Furria.Tests.Common.Builder;

public sealed record AnnouncementAttendanceIntent(
    int Position = 0,
    DateTimeOffset? AnswersUntil = null,
    DateTimeOffset? ClosedAt = null,
    DateTimeOffset? LastRemindedAt = null
);
