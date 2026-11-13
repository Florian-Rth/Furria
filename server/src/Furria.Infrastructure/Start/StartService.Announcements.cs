using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private const int AnnouncementNewDays = 60;

    private static StartAnnouncementSummary ToAnnouncementSummary(
        AnnouncementRow row,
        Viewer viewer,
        IReadOnlyDictionary<int, string> officeNames,
        IReadOnlyDictionary<int, AnnouncementMentionTargets> mentions,
        MediaPictures pictures
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            Body = row.Body,
            Mentions = mentions.GetValueOrDefault(
                row.AnnouncementId,
                AnnouncementMentionTargets.None
            ),
            PublishedAt = row.PublishedAt,
            ValidUntil = row.ValidUntil,
            IsNew = IsNewTo(row, viewer),
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

        var rows = await CurrentAnnouncements(viewer)
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Select(AnnouncementRows.Projection)
            .ToListAsync(ct);

        if (rows.Count == 0)
            return [];

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(viewer.Moment.Today, ct);
        var mentions = await _mentionTargets.OfAnnouncementsAsync(
            [.. rows.Select(row => row.AnnouncementId)],
            MentionReaderOf(viewer),
            ct
        );

        return
        [
            .. rows.Select(row =>
                ToAnnouncementSummary(row, viewer, officeNames, mentions, _pictures)
            ),
        ];
    }

    [Pure]
    private static MentionReader MentionReaderOf(Viewer viewer) =>
        new(viewer.PersonId, viewer.GrantedKeys.Contains(FurriaPermissions.CalendarManageClub));

    [Pure]
    private static bool IsNewTo(AnnouncementRow row, Viewer viewer) =>
        row.Author?.PersonId != viewer.PersonId
        && row.PublishedAt >= viewer.Moment.Now.AddDays(-AnnouncementNewDays)
        && (viewer.LastSeenAnnouncementAt is not { } lastSeen || row.PublishedAt > lastSeen);

    private IQueryable<Announcement> CurrentAnnouncements(Viewer viewer)
    {
        var today = viewer.Moment.Today;

        return _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.ValidUntil == null || announcement.ValidUntil >= today
            );
    }
}
