using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private Task<IReadOnlyList<ClubHubVenue>> VenuesAsync(DateOnly today, CancellationToken ct) =>
        Task.FromResult<IReadOnlyList<ClubHubVenue>>([]);
}
