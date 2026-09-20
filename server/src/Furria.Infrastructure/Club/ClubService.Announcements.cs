using Furria.Application.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private const int NewestAnnouncementsShown = 2;

    internal Task<IReadOnlyDictionary<int, string>> OfficeNamesOfRunningBoardSeatsAsync(
        DateOnly today,
        CancellationToken ct
    ) => RunningOfficeNamesAsync(today, ct);

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
            .Take(NewestAnnouncementsShown)
            .Select(announcement => new AnnouncementRow(
                announcement.Id,
                announcement.Title,
                announcement.Body,
                announcement.PublishedAt,
                announcement.ValidUntil,
                announcement.AuthorPersonId,
                announcement.Author!.FirstName,
                announcement.Author!.LastName,
                announcement.Author!.PortraitUrl
            ))
            .ToListAsync(ct);

        var officeNames = await RunningOfficeNamesAsync(today, ct);

        return new ClubHubAnnouncements
        {
            Newest = [.. rows.Select(row => ToHubAnnouncement(row, officeNames))],
            TotalCount = totalCount,
        };
    }

    private static ClubHubAnnouncement ToHubAnnouncement(
        AnnouncementRow row,
        IReadOnlyDictionary<int, string> officeNames
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            Body = row.Body,
            PublishedAt = row.PublishedAt,
            ValidUntil = row.ValidUntil,
            Author = new ClubHubPerson
            {
                PersonId = row.AuthorPersonId,
                FirstName = row.FirstName,
                LastName = row.LastName,
                PortraitUrl = row.PortraitUrl,
                OfficeName = officeNames.GetValueOrDefault(row.AuthorPersonId),
            },
        };

    private sealed record AnnouncementRow(
        int AnnouncementId,
        string Title,
        string Body,
        DateTimeOffset PublishedAt,
        DateOnly? ValidUntil,
        int AuthorPersonId,
        string FirstName,
        string LastName,
        string? PortraitUrl
    );
}
