using Furria.Application.Club;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private Task<ClubHubAnnouncements> AnnouncementsAsync(DateOnly today, CancellationToken ct) =>
        Task.FromResult(new ClubHubAnnouncements { Newest = [], TotalCount = 0 });
}
