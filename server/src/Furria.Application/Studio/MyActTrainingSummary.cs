using Furria.Core.Club;

namespace Furria.Application.Studio;

public sealed record MyActTrainingSummary
{
    public required int CalendarEntryId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }
}
