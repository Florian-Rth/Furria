using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    public async Task<IReadOnlyList<CurrentAnnouncementSummary>> GetCurrentAnnouncementsAsync(
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        return await _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.ValidUntil == null || announcement.ValidUntil >= today
            )
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Select(announcement => new CurrentAnnouncementSummary
            {
                AnnouncementId = announcement.Id,
                Title = announcement.Title,
                Body = announcement.Body,
                PublishedAt = announcement.PublishedAt,
                ValidUntil = announcement.ValidUntil,
            })
            .ToListAsync(ct);
    }
}
