using System.Diagnostics.Contracts;
using Furria.Application.WhatsApp;
using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppAnswers
{
    private readonly AppDbContext _dbContext;
    private readonly WhatsAppSenderMatch _senders;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;

    public WhatsAppAnswers(
        AppDbContext dbContext,
        WhatsAppSenderMatch senders,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _senders = senders;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task ApplyAsync(InboxWhatsAppEvent inboxEvent, CancellationToken ct)
    {
        if (inboxEvent.Session != _options.Value.Session)
            return;
        if (
            WahaAnswerEvents.Read(inboxEvent.Event, inboxEvent.Body, inboxEvent.OccurredAt)
            is not { } read
        )
            return;

        var answer = read with { AnsweredAt = Earlier(read.AnsweredAt, inboxEvent.ReceivedAt) };
        var sender = await IdentifiedAsync(answer.SenderId, ct);
        if (await LockedRecordAsync(answer.MessageKey, ct) is not { } record)
            return;
        if (await AddOnOfAsync(record, ct) is not { } addOn || addOn.IsClosedAt(answer.AnsweredAt))
            return;

        if (ChoiceOf(record, addOn, answer) is not { } given)
            return;

        var held = await _dbContext.WhatsAppAnswers.SingleOrDefaultAsync(
            row => row.WhatsAppMessageId == record.Id && row.SenderId == answer.SenderId,
            ct
        );
        if (held?.AnsweredAt > answer.AnsweredAt)
            return;

        var stored = held ?? Added(record.Id, answer.SenderId);
        await RecordAsync(stored, sender, given, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<IdentifiedSender> IdentifiedAsync(string senderId, CancellationToken ct)
    {
        var sender = await _senders.MatchAsync(senderId, ct);
        return new IdentifiedSender(
            sender,
            sender.PersonId is null
                ? Shortened(await _senders.NameOfAsync(senderId, sender, ct))
                : null
        );
    }

    private async Task RecordAsync(
        WhatsAppAnswer stored,
        IdentifiedSender identified,
        GivenChoice given,
        CancellationToken ct
    )
    {
        var sender = identified.Sender;
        stored.AnsweredAt = given.AnsweredAt;
        stored.PersonId = sender.PersonId;
        stored.SenderPhone = sender.PhoneDigits;
        stored.PollOptionIds = [.. given.PollOptionIds];
        stored.Attendance = given.Attendance;

        if (sender.PersonId is not { } personId)
        {
            stored.SenderName = identified.Name ?? stored.SenderName;
            return;
        }

        if (await MayAnswerAsync(given.AddOn.Host, personId, ct))
            await GiveAsync(given, personId, ct);
    }

    private WhatsAppAnswer Added(long messageRecordId, string senderId)
    {
        var answer = new WhatsAppAnswer
        {
            WhatsAppMessageId = messageRecordId,
            SenderId = senderId,
        };
        _dbContext.WhatsAppAnswers.Add(answer);
        return answer;
    }

    private async Task<WhatsAppMessage?> LockedRecordAsync(string messageKey, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            SELECT 1 FROM whatsapp_message
            WHERE message_key = {messageKey} AND add_on_kind IS NOT NULL
            FOR NO KEY UPDATE
            """,
            ct
        );

        return await _dbContext
            .WhatsAppMessages.AsNoTracking()
            .Where(message => message.MessageKey == messageKey && message.AddOnKind != null)
            .OrderByDescending(message => message.Id)
            .FirstOrDefaultAsync(ct);
    }

    private Task<AnsweredAddOn?> AddOnOfAsync(WhatsAppMessage record, CancellationToken ct) =>
        (record.AddOnKind, record.AddOnId, record.HostKind) switch
        {
            (WhatsAppAddOnKind.Poll, { } pollId, var hostKind) => PollOfAsync(
                new AnswerHost(hostKind, record.HostId),
                pollId,
                ct
            ),
            (WhatsAppAddOnKind.Attendance, _, WhatsAppHostKind.CalendarEntry) =>
                EntryAttendanceOfAsync(record.HostId, ct),
            (WhatsAppAddOnKind.Attendance, _, WhatsAppHostKind.Announcement) =>
                AnnouncementAttendanceOfAsync(record.HostId, ct),
            _ => Task.FromResult<AnsweredAddOn?>(null),
        };

    private async Task<AnsweredAddOn?> PollOfAsync(
        AnswerHost host,
        int pollId,
        CancellationToken ct
    )
    {
        await LockHostAsync(host, ct);
        await _dbContext.Database.ExecuteSqlAsync(
            $"SELECT 1 FROM poll WHERE id = {pollId} FOR NO KEY UPDATE",
            ct
        );

        var poll = await _dbContext
            .Polls.AsNoTracking()
            .Where(row => row.Id == pollId && !row.IsAnonymous)
            .Select(row => new
            {
                row.AllowsMultipleChoices,
                row.ClosedAt,
                row.VotesUntil,
                EntryStartsAt = (DateTimeOffset?)row.CalendarEntry!.StartsAt,
                AnnouncementValidUntil = (DateOnly?)row.Announcement!.ValidUntil,
                OptionIds = row.Options.Select(option => option.Id).ToList(),
            })
            .SingleOrDefaultAsync(ct);

        return poll is null
            ? null
            : new AnsweredAddOn(
                host,
                new AnsweredPoll(pollId, poll.AllowsMultipleChoices, poll.OptionIds.ToHashSet()),
                new AnswerWindow(
                    poll.ClosedAt,
                    poll.VotesUntil,
                    poll.EntryStartsAt ?? AnnouncementAddOns.ClosesAt(poll.AnnouncementValidUntil)
                )
            );
    }

    private async Task<AnsweredAddOn?> EntryAttendanceOfAsync(
        int calendarEntryId,
        CancellationToken ct
    )
    {
        var host = new AnswerHost(WhatsAppHostKind.CalendarEntry, calendarEntryId);
        await LockHostAsync(host, ct);
        var entry = await _dbContext
            .CalendarEntries.AsNoTracking()
            .Where(row => row.Id == calendarEntryId && row.AsksForResponse)
            .Select(row => new { row.StartsAt, row.EndsAt })
            .SingleOrDefaultAsync(ct);

        return entry is null
            ? null
            : new AnsweredAddOn(
                host,
                null,
                new AnswerWindow(null, null, AddOnClosing.EntryEndOf(entry.StartsAt, entry.EndsAt))
            );
    }

    private async Task<AnsweredAddOn?> AnnouncementAttendanceOfAsync(
        int announcementId,
        CancellationToken ct
    )
    {
        var host = new AnswerHost(WhatsAppHostKind.Announcement, announcementId);
        await LockHostAsync(host, ct);
        var announcement = await _dbContext
            .Announcements.AsNoTracking()
            .Where(row => row.Id == announcementId && row.AttendancePosition != null)
            .Select(row => new
            {
                row.AttendanceClosedAt,
                row.AnswersUntil,
                row.ValidUntil,
            })
            .SingleOrDefaultAsync(ct);

        return announcement is null
            ? null
            : new AnsweredAddOn(
                host,
                null,
                new AnswerWindow(
                    announcement.AttendanceClosedAt,
                    announcement.AnswersUntil,
                    AnnouncementAddOns.ClosesAt(announcement.ValidUntil)
                )
            );
    }

    private Task LockHostAsync(AnswerHost host, CancellationToken ct) =>
        host.Kind == WhatsAppHostKind.Announcement
            ? _dbContext.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM announcement WHERE id = {host.Id} FOR SHARE",
                ct
            )
            : _dbContext.Database.ExecuteSqlAsync(
                $"SELECT 1 FROM calendar_entry WHERE id = {host.Id} FOR SHARE",
                ct
            );

    private async Task<bool> MayAnswerAsync(AnswerHost host, int personId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);
        if (host.Kind == WhatsAppHostKind.Announcement)
            return await _dbContext.IsConcernedByAnnouncementsAsync(personId, today, ct);

        var facts = (
            await _dbContext
                .CalendarEntries.AsNoTracking()
                .Where(entry => entry.Id == host.Id)
                .Select(EntryFactsRows.Projection)
                .SingleAsync(ct)
        ).ToFacts();
        var ties = await _dbContext.CalendarTiesOfAsync(personId, today, ct);

        return ties.IsHers(facts);
    }

    private Task GiveAsync(GivenChoice given, int personId, CancellationToken ct) =>
        (given.AddOn.Poll, given.AddOn.Host.Kind) switch
        {
            ({ } poll, _) => GiveVotesAsync(poll, given, personId, ct),
            (null, WhatsAppHostKind.CalendarEntry) => GiveEntryAttendanceAsync(given, personId, ct),
            _ => GiveAnnouncementAttendanceAsync(given, personId, ct),
        };

    private async Task GiveVotesAsync(
        AnsweredPoll poll,
        GivenChoice given,
        int personId,
        CancellationToken ct
    )
    {
        var held = await _dbContext
            .PollVotes.Where(vote => vote.PollId == poll.PollId && vote.PersonId == personId)
            .ToListAsync(ct);
        if (
            held.Any(vote => IsNewerAppAnswer(vote.IsGivenThroughWhatsApp, vote.UpdatedAt, given))
            || (!poll.AllowsMultipleChoices && given.PollOptionIds.Count > 1)
        )
            return;
        if (given.PollOptionIds.Count == 0 && held.Any(vote => !vote.IsGivenThroughWhatsApp))
            return;

        _dbContext.PollVotes.RemoveRange(
            held.Where(vote => !given.PollOptionIds.Contains(vote.PollOptionId))
        );
        foreach (var kept in held.Where(vote => given.PollOptionIds.Contains(vote.PollOptionId)))
            kept.IsGivenThroughWhatsApp = true;
        _dbContext.PollVotes.AddRange(
            given
                .PollOptionIds.Where(optionId => held.All(vote => vote.PollOptionId != optionId))
                .Select(optionId => new PollVote
                {
                    PollId = poll.PollId,
                    PollOptionId = optionId,
                    PersonId = personId,
                    IsGivenThroughWhatsApp = true,
                })
        );
    }

    private async Task GiveEntryAttendanceAsync(
        GivenChoice given,
        int personId,
        CancellationToken ct
    )
    {
        var entryId = given.AddOn.Host.Id;
        var response = await _dbContext.LockedResponseAsync(entryId, personId, ct);
        if (IsKeptAgainst(response, given))
            return;

        if (given.Attendance is not { } attendance)
        {
            RemoveWithdrawn(response);
            return;
        }

        _dbContext.Record(
            response,
            new AttendanceRecord(
                entryId,
                personId,
                attendance,
                IsRecordedOnBehalf: false,
                RecordedByPersonId: null,
                IsGivenThroughWhatsApp: true
            ),
            given.AnsweredAt
        );
    }

    private async Task GiveAnnouncementAttendanceAsync(
        GivenChoice given,
        int personId,
        CancellationToken ct
    )
    {
        var announcementId = given.AddOn.Host.Id;
        var response = await _dbContext.LockedAnnouncementResponseAsync(
            announcementId,
            personId,
            ct
        );
        if (IsKeptAgainst(response, given))
            return;

        if (given.Attendance is not { } attendance)
        {
            RemoveWithdrawn(response);
            return;
        }

        if (response is null)
        {
            response = new AttendanceResponse
            {
                AnnouncementId = announcementId,
                PersonId = personId,
            };
            _dbContext.AttendanceResponses.Add(response);
        }

        response.Answer = attendance;
        response.IsGivenThroughWhatsApp = true;
    }

    private void RemoveWithdrawn(AttendanceResponse? response)
    {
        if (response is not null)
            _dbContext.AttendanceResponses.Remove(response);
    }

    [Pure]
    private static bool IsKeptAgainst(AttendanceResponse? response, GivenChoice given) =>
        response is null
            ? given.Attendance is null
            : IsNewerAppAnswer(response.IsGivenThroughWhatsApp, response.UpdatedAt, given)
                || (given.Attendance is null && !response.IsGivenThroughWhatsApp);

    [Pure]
    private static bool IsNewerAppAnswer(
        bool isGivenThroughWhatsApp,
        DateTimeOffset updatedAt,
        GivenChoice given
    ) => !isGivenThroughWhatsApp && updatedAt > given.AnsweredAt;

    [Pure]
    private static GivenChoice? ChoiceOf(
        WhatsAppMessage record,
        AnsweredAddOn addOn,
        WhatsAppIncomingAnswer answer
    ) =>
        addOn.Poll is { } poll
            ? PollChoiceOf(record, addOn, poll, answer)
            : AttendanceChoiceOf(record, addOn, answer);

    [Pure]
    private static GivenChoice? PollChoiceOf(
        WhatsAppMessage record,
        AnsweredAddOn addOn,
        AnsweredPoll poll,
        WhatsAppIncomingAnswer answer
    )
    {
        IReadOnlyList<int> optionIds =
        [
            .. WhatsAppAnswerRules
                .PollOptionIdsOf(record.PollOptions, record.PollOptionIds, answer.SelectedOptions)
                .Where(poll.OptionIds.Contains),
        ];
        var isUnreadable = optionIds.Count == 0 && answer.SelectedOptions.Count > 0;

        return isUnreadable ? null : new GivenChoice(addOn, answer.AnsweredAt, optionIds, null);
    }

    [Pure]
    private static GivenChoice? AttendanceChoiceOf(
        WhatsAppMessage record,
        AnsweredAddOn addOn,
        WhatsAppIncomingAnswer answer
    )
    {
        var isPoll = record.PollOptions.Count > 0;
        var attendance = isPoll
            ? WhatsAppAnswerRules.AttendanceOf(record.PollOptions, answer.SelectedOptions)
            : answer.Attendance;
        var isWithdrawal = isPoll && answer.SelectedOptions.Count == 0;

        return attendance is null && !isWithdrawal
            ? null
            : new GivenChoice(addOn, answer.AnsweredAt, [], attendance);
    }

    [Pure]
    private static DateTimeOffset Earlier(DateTimeOffset left, DateTimeOffset right) =>
        left < right ? left : right;

    [Pure]
    private static string? Shortened(string? name) =>
        name is { Length: > WhatsAppAnswer.SenderNameLength }
            ? name[..WhatsAppAnswer.SenderNameLength]
            : name;

    private sealed record IdentifiedSender(WhatsAppSender Sender, string? Name);

    private sealed record AnswerHost(WhatsAppHostKind Kind, int Id);

    private sealed record AnsweredPoll(
        int PollId,
        bool AllowsMultipleChoices,
        IReadOnlySet<int> OptionIds
    );

    private sealed record AnswerWindow(
        DateTimeOffset? ClosedAt,
        DateTimeOffset? Deadline,
        DateTimeOffset? HostClosesAt
    );

    private sealed record AnsweredAddOn(AnswerHost Host, AnsweredPoll? Poll, AnswerWindow Window)
    {
        [Pure]
        public bool IsClosedAt(DateTimeOffset answeredAt) =>
            WhatsAppAnswerRules.IsClosedAt(
                Window.ClosedAt,
                Window.Deadline,
                Window.HostClosesAt,
                answeredAt
            );
    }

    private sealed record GivenChoice(
        AnsweredAddOn AddOn,
        DateTimeOffset AnsweredAt,
        IReadOnlyList<int> PollOptionIds,
        AttendanceAnswer? Attendance
    );
}
