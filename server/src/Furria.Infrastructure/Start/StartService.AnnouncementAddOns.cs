using System.Diagnostics.Contracts;
using Furria.Application.Authorization;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private async Task<IReadOnlyList<StartAnnouncementAddOns>> AnnouncementAddOnCandidatesAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        if (
            !viewer.GrantedKeys.Contains(FurriaPermissions.ClubRead)
            || !viewer.Ties.IsRunningMemberIn(ClubSession.YearOf(viewer.Moment.Today))
        )
            return [];

        var rows = await AnnouncementsWithOpenAddOnsAsync(viewer.Moment, ct);

        if (rows.Count == 0)
            return [];

        var announcementIds = rows.Select(row => row.AnnouncementId).ToList();
        var addOns = await OpenAddOnsOfAnnouncementsAsync(viewer, announcementIds, ct);
        var answers = await AnnouncementAnswersOfAsync(viewer.PersonId, announcementIds, ct);

        return
        [
            .. rows.Select(row =>
                    ToAnnouncementAddOns(
                        row,
                        answers.GetValueOrDefault(row.AnnouncementId),
                        addOns,
                        viewer.Moment.Now
                    )
                )
                .Where(HoldsAnythingOpen),
        ];
    }

    [Pure]
    private static StartAnnouncementAddOns ToAnnouncementAddOns(
        AnnouncementAddOnsRow row,
        AttendanceAnswer? answer,
        OpenAddOnsOfHosts addOns,
        DateTimeOffset now
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            PublishedAt = row.PublishedAt,
            Attendance =
                row.AttendancePosition is { } position && row.IsAttendanceOpenAt(now)
                    ? new StartAnnouncementAttendance
                    {
                        Position = position,
                        ViewerAnswer = answer,
                        IsOwed = answer is null,
                    }
                    : null,
            OpenPolls = addOns.PollsOf(row.AnnouncementId),
            OpenSignUpLists = addOns.SignUpListsOf(row.AnnouncementId),
        };

    [Pure]
    private static bool HoldsAnythingOpen(StartAnnouncementAddOns announcement) =>
        announcement.Attendance is not null
        || announcement.OpenPolls.Count > 0
        || announcement.OpenSignUpLists.Count > 0;

    private Task<List<AnnouncementAddOnsRow>> AnnouncementsWithOpenAddOnsAsync(
        StartMoment moment,
        CancellationToken ct
    )
    {
        var now = moment.Now;
        var today = moment.Today;

        return _dbContext
            .Announcements.AsNoTracking()
            .Where(announcement =>
                announcement.ValidUntil == null || announcement.ValidUntil >= today
            )
            .Where(announcement =>
                (
                    announcement.AttendancePosition != null
                    && announcement.AttendanceClosedAt == null
                    && (announcement.AnswersUntil == null || announcement.AnswersUntil > now)
                )
                || announcement.Polls.Any(poll =>
                    poll.ClosedAt == null && (poll.VotesUntil == null || poll.VotesUntil > now)
                )
                || announcement.SignUpLists.Any(list =>
                    list.ClosedAt == null && (list.SignUpUntil == null || list.SignUpUntil > now)
                )
            )
            .Select(announcement => new AnnouncementAddOnsRow(
                announcement.Id,
                announcement.Title,
                announcement.PublishedAt,
                announcement.ValidUntil,
                announcement.AttendancePosition,
                announcement.AnswersUntil,
                announcement.AttendanceClosedAt
            ))
            .ToListAsync(ct);
    }

    private async Task<OpenAddOnsOfHosts> OpenAddOnsOfAnnouncementsAsync(
        Viewer viewer,
        IReadOnlyList<int> announcementIds,
        CancellationToken ct
    ) =>
        new(
            await _dbContext.PollsOfAnnouncementsAsync(
                announcementIds,
                viewer.PersonId,
                viewer.Moment.Now,
                ct
            ),
            await _dbContext.SignUpListsOfAnnouncementsAsync(
                announcementIds,
                viewer.PersonId,
                viewer.Moment.Now,
                ct
            )
        );

    private async Task<IReadOnlyDictionary<int, AttendanceAnswer?>> AnnouncementAnswersOfAsync(
        int personId,
        IReadOnlyList<int> announcementIds,
        CancellationToken ct
    ) =>
        await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response =>
                response.PersonId == personId
                && announcementIds.Contains(response.AnnouncementId!.Value)
            )
            .ToDictionaryAsync(
                response => response.AnnouncementId!.Value,
                response => (AttendanceAnswer?)response.Answer,
                ct
            );

    private sealed record AnnouncementAddOnsRow(
        int AnnouncementId,
        string Title,
        DateTimeOffset PublishedAt,
        DateOnly? ValidUntil,
        int? AttendancePosition,
        DateTimeOffset? AnswersUntil,
        DateTimeOffset? AttendanceClosedAt
    )
    {
        [Pure]
        public bool IsAttendanceOpenAt(DateTimeOffset now) =>
            !AddOnClosing.IsClosed(
                AttendanceClosedAt,
                AnswersUntil,
                AnnouncementAddOns.ClosesAt(ValidUntil),
                now
            );
    }
}
