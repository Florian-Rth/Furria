using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private const int HubAnnouncementCount = 2;

    private async Task<ClubHubAnnouncements> AnnouncementsAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var unexpired = _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.ValidUntil == null || announcement.ValidUntil >= today
            );

        var totalCount = await unexpired.CountAsync(ct);

        var rows = await unexpired
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Take(HubAnnouncementCount)
            .Select(AnnouncementRows.Projection)
            .ToListAsync(ct);

        if (rows.Count == 0)
            return new ClubHubAnnouncements { Newest = [], TotalCount = totalCount };

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(today, ct);

        return new ClubHubAnnouncements
        {
            Newest = [.. rows.Select(row => ToHubAnnouncement(row, officeNames, _pictures))],
            TotalCount = totalCount,
        };
    }

    private static ClubHubAnnouncement ToHubAnnouncement(
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
                ? new ClubHubPerson
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
}
