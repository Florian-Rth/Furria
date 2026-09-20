using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private Task<IReadOnlyList<ClubHubCalendarEntry>> CalendarAsync(
        DateTimeOffset now,
        CancellationToken ct
    ) => Task.FromResult<IReadOnlyList<ClubHubCalendarEntry>>([]);
}
