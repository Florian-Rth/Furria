using System.Diagnostics.Contracts;
using Furria.Application.WhatsApp;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppResults
{
    private readonly AppDbContext _dbContext;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;

    public WhatsAppResults(
        AppDbContext dbContext,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task StageDueAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return;

        var now = _timeProvider.GetUtcNow();
        var dueIds = (await ClosingsAsync(ct))
            .Where(closing => closing.IsDueAt(now))
            .Select(closing => closing.Record.Id)
            .ToList();
        if (dueIds.Count == 0)
            return;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        foreach (var dueId in dueIds)
        {
            if (await LockedAsync(dueId, ct) is not { } record)
                continue;

            _dbContext.OutboxWhatsApps.Add(
                WhatsAppOutboxRows.TargetingOf(
                    new WhatsAppAddressedHost(
                        record.ChatId,
                        new WhatsAppHost(record.HostKind, record.HostId),
                        now
                    ),
                    WhatsAppTargeting.ReplyTo(record.MessageId, await ResultOfAsync(record, ct))
                )
            );
            record.ResultToldAt = now;
        }
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    private Task<WhatsAppMessage?> LockedAsync(long recordId, CancellationToken ct) =>
        _dbContext
            .WhatsAppMessages.FromSql(
                $"SELECT * FROM whatsapp_message WHERE id = {recordId} FOR UPDATE SKIP LOCKED"
            )
            .SingleOrDefaultAsync(ct);

    private async Task<IEnumerable<Closing>> ClosingsAsync(CancellationToken ct) =>
        [
            .. await PollClosingsAsync(ct),
            .. await EntryAttendanceClosingsAsync(ct),
            .. await AnnouncementAttendanceClosingsAsync(ct),
        ];

    private async Task<IReadOnlyList<Closing>> PollClosingsAsync(CancellationToken ct) =>
        [
            .. (
                await _dbContext
                    .WhatsAppMessages.AsNoTracking()
                    .Where(record =>
                        record.AddOnKind == WhatsAppAddOnKind.Poll && record.PollOptions.Count != 0
                    )
                    .Join(
                        _dbContext.Polls,
                        record => record.AddOnId,
                        poll => poll.Id,
                        (record, poll) =>
                            new
                            {
                                Record = record,
                                poll.ClosedAt,
                                poll.VotesUntil,
                                EntryStartsAt = (DateTimeOffset?)poll.CalendarEntry!.StartsAt,
                                AnnouncementValidUntil = (DateOnly?)poll.Announcement!.ValidUntil,
                            }
                    )
                    .Where(row =>
                        row.Record.ResultToldAt == null
                        || row.ClosedAt > row.Record.ResultToldAt
                        || row.VotesUntil > row.Record.ResultToldAt
                        || row.EntryStartsAt > row.Record.ResultToldAt
                    )
                    .ToListAsync(ct)
            ).Select(row => new Closing(
                row.Record,
                new AddOnWindow(
                    row.ClosedAt,
                    row.VotesUntil,
                    row.EntryStartsAt ?? AnnouncementAddOns.ClosesAt(row.AnnouncementValidUntil)
                )
            )),
        ];

    private async Task<IReadOnlyList<Closing>> EntryAttendanceClosingsAsync(CancellationToken ct) =>
        [
            .. (
                await AttendanceRecords(WhatsAppHostKind.CalendarEntry)
                    .Where(record => record.ResultToldAt == null)
                    .Join(
                        _dbContext.CalendarEntries,
                        record => record.HostId,
                        entry => entry.Id,
                        (record, entry) =>
                            new
                            {
                                Record = record,
                                entry.StartsAt,
                                entry.EndsAt,
                            }
                    )
                    .ToListAsync(ct)
            ).Select(row => new Closing(
                row.Record,
                new AddOnWindow(null, null, AddOnClosing.EntryEndOf(row.StartsAt, row.EndsAt))
            )),
        ];

    private async Task<IReadOnlyList<Closing>> AnnouncementAttendanceClosingsAsync(
        CancellationToken ct
    ) =>
        [
            .. (
                await AttendanceRecords(WhatsAppHostKind.Announcement)
                    .Join(
                        _dbContext.Announcements,
                        record => record.HostId,
                        announcement => announcement.Id,
                        (record, announcement) =>
                            new
                            {
                                Record = record,
                                announcement.AttendanceClosedAt,
                                announcement.AnswersUntil,
                                announcement.ValidUntil,
                            }
                    )
                    .Where(row =>
                        row.Record.ResultToldAt == null
                        || row.AttendanceClosedAt > row.Record.ResultToldAt
                        || row.AnswersUntil > row.Record.ResultToldAt
                    )
                    .ToListAsync(ct)
            ).Select(row => new Closing(
                row.Record,
                new AddOnWindow(
                    row.AttendanceClosedAt,
                    row.AnswersUntil,
                    AnnouncementAddOns.ClosesAt(row.ValidUntil)
                )
            )),
        ];

    private IQueryable<WhatsAppMessage> AttendanceRecords(WhatsAppHostKind hostKind) =>
        _dbContext
            .WhatsAppMessages.AsNoTracking()
            .Where(record =>
                record.AddOnKind == WhatsAppAddOnKind.Attendance && record.HostKind == hostKind
            );

    private Task<string> ResultOfAsync(WhatsAppMessage record, CancellationToken ct) =>
        record.AddOnId is { } pollId
            ? PollResultAsync(pollId, ct)
            : AttendanceResultAsync(record, ct);

    private async Task<string> PollResultAsync(int pollId, CancellationToken ct) =>
        WhatsAppReplies.PollResult(
            await _dbContext
                .PollOptions.AsNoTracking()
                .Where(option => option.PollId == pollId)
                .OrderBy(option => option.Position)
                .Select(option => new WhatsAppResultCount(
                    option.Label,
                    _dbContext.PollVotes.Count(vote => vote.PollOptionId == option.Id)
                ))
                .ToListAsync(ct)
        );

    private async Task<string> AttendanceResultAsync(WhatsAppMessage record, CancellationToken ct)
    {
        var responses = _dbContext.AttendanceResponses.AsNoTracking();
        var answered =
            record.HostKind == WhatsAppHostKind.CalendarEntry
                ? responses.Where(response => response.CalendarEntryId == record.HostId)
                : responses.Where(response => response.AnnouncementId == record.HostId);

        return WhatsAppReplies.AttendanceResult(
            await answered
                .GroupBy(response => response.Answer)
                .Select(answers => new { Answer = answers.Key, Count = answers.Count() })
                .ToDictionaryAsync(answers => answers.Answer, answers => answers.Count, ct)
        );
    }

    private sealed record AddOnWindow(
        DateTimeOffset? ClosedAt,
        DateTimeOffset? Deadline,
        DateTimeOffset? HostClosesAt
    );

    private sealed record Closing(WhatsAppMessage Record, AddOnWindow Window)
    {
        [Pure]
        public bool IsDueAt(DateTimeOffset now) =>
            (Window.ClosedAt ?? AddOnClosing.StampOf(Window.Deadline, Window.HostClosesAt, now))
                is { } closedAt
            && (Record.ResultToldAt is not { } toldAt || closedAt > toldAt);
    }
}
