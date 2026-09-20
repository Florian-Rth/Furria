using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private Task<IReadOnlyList<ClubHubBoardSeat>> BoardAsync(
        DateOnly today,
        CancellationToken ct
    ) => Task.FromResult<IReadOnlyList<ClubHubBoardSeat>>([]);

    private Task<IReadOnlyDictionary<int, string>> RunningOfficeNamesAsync(
        DateOnly today,
        CancellationToken ct
    ) => Task.FromResult<IReadOnlyDictionary<int, string>>(new Dictionary<int, string>());
}
