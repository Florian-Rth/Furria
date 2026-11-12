namespace Furria.Application.Club;

public sealed record AnnouncementAttendanceInput
{
    public required DateTimeOffset? AnswersUntil { get; init; }
}
