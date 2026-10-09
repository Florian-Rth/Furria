using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private const int AnnouncementReachDays = 60;

    private static StartAnnouncementSummary ToAnnouncementSummary(
        AnnouncementRow row,
        IReadOnlyDictionary<int, string> officeNames,
        MediaPictures pictures
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            Body = row.Body,
            PublishedAt = row.PublishedAt,
            ValidUntil = row.ValidUntil,
            Author = row.Author is { } author
                ? new StartPerson
                {
                    PersonId = author.PersonId,
                    FirstName = author.FirstName,
                    LastName = author.LastName,
                    Portrait = pictures.PortraitOf(
                        author.PersonId,
                        author.PortraitId,
                        author.PortraitRenderedAt
                    ),
                    OfficeName = officeNames.GetValueOrDefault(author.PersonId),
                }
                : null,
        };

    private async Task<IReadOnlyList<StartAnnouncementSummary>> AnnouncementCandidatesAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        if (!viewer.GrantedKeys.Contains(FurriaPermissions.ClubRead))
            return [];

        var rows = await UnseenAnnouncements(viewer)
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Select(AnnouncementRows.Projection)
            .ToListAsync(ct);

        if (rows.Count == 0)
            return [];

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(viewer.Moment.Today, ct);

        return [.. rows.Select(row => ToAnnouncementSummary(row, officeNames, _pictures))];
    }

    private IQueryable<Announcement> UnseenAnnouncements(Viewer viewer)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var publishedSince = viewer.Moment.Now.AddDays(-AnnouncementReachDays);
        var current = _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.AuthorPersonId != personId
                && announcement.PublishedAt >= publishedSince
                && (announcement.ValidUntil == null || announcement.ValidUntil >= today)
            );

        return viewer.LastSeenAnnouncementAt is { } lastSeen
            ? current.Where(announcement => announcement.PublishedAt > lastSeen)
            : current;
    }
}
