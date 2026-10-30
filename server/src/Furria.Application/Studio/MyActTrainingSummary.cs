using Furria.Core.Club;

namespace Furria.Application.Studio;

public sealed record MyActTrainingSummary
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required int Present { get; init; }

    public required int Absent { get; init; }
}
