using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    public Task<IReadOnlyList<AnnouncementSummary>> GetCurrentAnnouncementsSeenByAsync(
        AnnouncementSightQuery query,
        CancellationToken ct
    ) => CurrentSeenByAsync(query, CurrentAnnouncements(), ct);

    public async Task<AnnouncementSummary?> GetCurrentAnnouncementSeenByAsync(
        AnnouncementSightQuery query,
        int announcementId,
        CancellationToken ct
    ) =>
        (
            await CurrentSeenByAsync(
                query,
                CurrentAnnouncements().Where(announcement => announcement.Id == announcementId),
                ct
            )
        ).SingleOrDefault();

    private IQueryable<Announcement> CurrentAnnouncements()
    {
        var today = ClubClock.Today(_timeProvider);

        return _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.ValidUntil == null || announcement.ValidUntil >= today
            );
    }

    private async Task<IReadOnlyList<AnnouncementSummary>> CurrentSeenByAsync(
        AnnouncementSightQuery query,
        IQueryable<Announcement> announcements,
        CancellationToken ct
    ) =>
        await SummariesAsync(
            await announcements
                .OrderByDescending(announcement => announcement.PublishedAt)
                .ThenByDescending(announcement => announcement.Id)
                .Select(AnnouncementRows.Projection)
                .ToListAsync(ct),
            new SummariesReader(
                new MentionReader(query.PersonId, query.Rights.ManagesClubCalendar),
                new AddOnsReader(
                    query.PersonId,
                    MayPostAnnouncements: false,
                    new PersonLender(query.PersonId, query.Rights)
                )
            ),
            ct
        );
}
