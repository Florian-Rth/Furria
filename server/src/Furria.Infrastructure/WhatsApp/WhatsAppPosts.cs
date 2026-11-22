using System.Diagnostics.Contracts;
using Furria.Application.ClubApp;
using Furria.Application.WhatsApp;
using Furria.Core.Club;
using Furria.Core.Text;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppPosts
{
    private readonly AppDbContext _dbContext;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly IOptions<ClubAppOptions> _clubApp;
    private readonly TimeProvider _timeProvider;

    public WhatsAppPosts(
        AppDbContext dbContext,
        IOptions<WhatsAppOptions> options,
        IOptions<ClubAppOptions> clubApp,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _options = options;
        _clubApp = clubApp;
        _timeProvider = timeProvider;
    }

    public async Task StageAnnouncementAsync(Announcement announcement, CancellationToken ct)
    {
        if (await ClubChatIdAsync(ct) is not { } chatId)
            return;

        Stage(chatId, await RenderAnnouncementAsync(announcement, ct));
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task StageCalendarEntryAsync(
        CalendarEntry entry,
        int? authorPersonId,
        CancellationToken ct
    )
    {
        if (entry.Audience != CalendarEntryAudience.Club)
            return;
        if (await ClubChatIdAsync(ct) is not { } chatId)
            return;

        Stage(chatId, await RenderCalendarEntryAsync(entry, authorPersonId, ct));
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<WhatsAppRenderedPost> RenderAnnouncementAsync(
        Announcement announcement,
        CancellationToken ct
    )
    {
        var link = WhatsAppHostLinks.AnnouncementOf(_clubApp.Value.BaseUrl, announcement.Id);
        var post = WhatsAppPostText.Render(
            new WhatsAppPostDraft
            {
                Badge = WhatsAppBadge.Announcement,
                Title = announcement.Title,
                Slot = null,
                Body = WhatsAppPostBody.Rich(announcement.Body),
                MentionablePhones = await MentionablePhonesAsync(announcement.Mentions, ct),
                Schedules = [],
                GroupNames = [],
                TakenOverAddOns = await TakenOverAddOnsAsync(announcement.BorrowedAddOns, ct),
                AuthorName = await NameOfAsync(announcement.AuthorPersonId, ct),
                Link = link,
            }
        );
        return new WhatsAppRenderedPost(
            new WhatsAppHost(WhatsAppHostKind.Announcement, announcement.Id),
            post,
            [
                .. AddOnMessagesOf(
                    new AddOnPositions(
                        announcement.AttendancePosition,
                        announcement.Polls,
                        announcement.SignUpLists
                    ),
                    WhatsAppAddOnMessages.AttendancePoll(
                        announcement.Title,
                        announcement.AnswersUntil
                    ),
                    link
                ),
            ],
            null
        );
    }

    public async Task<WhatsAppRenderedPost> RenderCalendarEntryAsync(
        CalendarEntry entry,
        int? authorPersonId,
        CancellationToken ct
    )
    {
        var slot = new WhatsAppPostSlot(
            entry.StartsAt,
            entry.EndsAt,
            await VenueNameAsync(entry.VenueId, ct)
        );
        var link = WhatsAppHostLinks.CalendarEntryOf(_clubApp.Value.BaseUrl, entry.Id);
        var post = WhatsAppPostText.Render(
            new WhatsAppPostDraft
            {
                Badge = WhatsAppBadges.OfEntryKind(entry.Kind),
                Title = entry.Title,
                Slot = slot,
                Body = entry.Description is { } description
                    ? WhatsAppPostBody.Plain(description)
                    : null,
                MentionablePhones = new Dictionary<int, string>(),
                Schedules = SchedulesOf(entry),
                GroupNames = await GroupNamesAsync(entry, ct),
                TakenOverAddOns = [],
                AuthorName = await NameOfAsync(authorPersonId, ct),
                Link = link,
            }
        );
        return new WhatsAppRenderedPost(
            new WhatsAppHost(WhatsAppHostKind.CalendarEntry, entry.Id),
            post,
            [
                .. AddOnMessagesOf(
                    new AddOnPositions(entry.AttendancePosition, entry.Polls, entry.SignUpLists),
                    WhatsAppAddOnMessages.AttendanceEvent(entry.Title, slot),
                    link
                ),
            ],
            slot
        );
    }

    private void Stage(string chatId, WhatsAppRenderedPost rendered)
    {
        var addressed = new WhatsAppAddressedHost(chatId, rendered.Host, _timeProvider.GetUtcNow());
        _dbContext.OutboxWhatsApps.Add(WhatsAppOutboxRows.PostOf(addressed, rendered.Post));
        _dbContext.OutboxWhatsApps.AddRange(
            rendered.AddOns.Select(message => WhatsAppOutboxRows.AddOnOf(addressed, message))
        );
    }

    [Pure]
    private static IEnumerable<WhatsAppAddOnMessage> AddOnMessagesOf(
        AddOnPositions addOns,
        WhatsAppAddOnMessage attendance,
        string link
    ) =>
        Placed(addOns.AttendancePosition, attendance)
            .Concat(
                addOns.Polls.Select(poll =>
                    (poll.Position, Message: WhatsAppAddOnMessages.PollOf(poll, link))
                )
            )
            .Concat(
                addOns.SignUpLists.Select(list =>
                    (list.Position, Message: WhatsAppAddOnMessages.SignUpListOf(list, link))
                )
            )
            .OrderBy(addOn => addOn.Position)
            .Select(addOn => addOn.Message);

    [Pure]
    private static IEnumerable<(int Position, WhatsAppAddOnMessage Message)> Placed(
        int? position,
        WhatsAppAddOnMessage message
    ) => position is { } placed ? [(placed, message)] : [];

    private async Task<IReadOnlyList<WhatsAppAddOnLine>> TakenOverAddOnsAsync(
        IEnumerable<AnnouncementBorrowedAddOn> loans,
        CancellationToken ct
    )
    {
        var ordered = loans.OrderBy(loan => loan.Position).ToList();
        if (ordered.Count == 0)
            return [];

        var names = await TakenOverNamesAsync(ordered, ct);
        return
        [
            .. ordered.Select(loan =>
                TakenOverLineOf(
                    loan,
                    names,
                    WhatsAppHostLinks.CalendarEntryOf(_clubApp.Value.BaseUrl, loan.CalendarEntryId)
                )
            ),
        ];
    }

    private async Task<TakenOverNames> TakenOverNamesAsync(
        IReadOnlyList<AnnouncementBorrowedAddOn> loans,
        CancellationToken ct
    )
    {
        var entryIds = loans.Select(loan => loan.CalendarEntryId).Distinct().ToList();
        var pollIds = loans.Select(loan => loan.PollId).OfType<int>().ToList();
        var listIds = loans.Select(loan => loan.SignUpListId).OfType<int>().ToList();

        return new TakenOverNames(
            await _dbContext
                .CalendarEntries.AsNoTracking()
                .Where(entry => entryIds.Contains(entry.Id))
                .ToDictionaryAsync(entry => entry.Id, entry => entry.Title, ct),
            await _dbContext
                .Polls.AsNoTracking()
                .Where(poll => pollIds.Contains(poll.Id))
                .ToDictionaryAsync(
                    poll => poll.Id,
                    poll => new TakenOverPoll(poll.Question, poll.IsAnonymous, poll.VotesUntil),
                    ct
                ),
            await _dbContext
                .SignUpLists.AsNoTracking()
                .Where(list => listIds.Contains(list.Id))
                .ToDictionaryAsync(
                    list => list.Id,
                    list => new TakenOverList(list.Title, list.SignUpUntil),
                    ct
                )
        );
    }

    [Pure]
    private static WhatsAppAddOnLine TakenOverLineOf(
        AnnouncementBorrowedAddOn loan,
        TakenOverNames names,
        string link
    ) =>
        (loan.Kind, loan.PollId, loan.SignUpListId) switch
        {
            (AnnouncementAddOnKind.Poll, { } pollId, _) => new WhatsAppAddOnLine(
                names.Polls[pollId].IsAnonymous
                    ? WhatsAppAddOnMessages.AnonymousVoteLead
                    : WhatsAppAddOnMessages.VoteLead,
                names.Polls[pollId].Question,
                names.Polls[pollId].VotesUntil,
                link
            ),
            (AnnouncementAddOnKind.SignUpList, _, { } listId) => new WhatsAppAddOnLine(
                WhatsAppAddOnMessages.SignUpLead,
                names.SignUpLists[listId].Title,
                names.SignUpLists[listId].SignUpUntil,
                link
            ),
            (AnnouncementAddOnKind.Attendance, _, _) => new WhatsAppAddOnLine(
                WhatsAppAddOnMessages.AttendanceLead,
                names.EntryTitles[loan.CalendarEntryId],
                null,
                link
            ),
            _ => throw new InvalidOperationException(
                $"Taken-over add-on {loan.Id} names no {loan.Kind} it borrows."
            ),
        };

    private async Task<string?> ClubChatIdAsync(CancellationToken ct) =>
        _options.Value.IsConfigured
            ? await _dbContext
                .LinkedWhatsAppGroups.AsNoTracking()
                .Where(link => link.GroupId == null)
                .Select(link => link.ChatId)
                .SingleOrDefaultAsync(ct)
            : null;

    private async Task<IReadOnlyDictionary<int, string>> MentionablePhonesAsync(
        IEnumerable<AnnouncementMention> mentions,
        CancellationToken ct
    )
    {
        var personIds = mentions
            .Where(mention => mention.Kind == MentionKind.Person)
            .Select(mention => mention.TargetId)
            .ToList();
        if (personIds.Count == 0)
            return new Dictionary<int, string>();

        var phones = await _dbContext
            .People.AsNoTracking()
            .Where(person => personIds.Contains(person.Id) && person.Phone != null)
            .Select(person => new { person.Id, person.Phone })
            .ToListAsync(ct);

        return phones
            .Select(person =>
                (person.Id, Digits: WhatsAppPhoneNumbers.InternationalDigitsOf(person.Phone ?? ""))
            )
            .Where(person => person.Digits is not null)
            .ToDictionary(person => person.Id, person => person.Digits ?? "");
    }

    private async Task<string?> NameOfAsync(int? personId, CancellationToken ct) =>
        personId is { } id
            ? await _dbContext
                .People.AsNoTracking()
                .Where(person => person.Id == id)
                .Select(person => person.FirstName + " " + person.LastName)
                .SingleOrDefaultAsync(ct)
            : null;

    private async Task<string?> VenueNameAsync(int? venueId, CancellationToken ct) =>
        venueId is { } id
            ? await _dbContext
                .Venues.AsNoTracking()
                .Where(venue => venue.Id == id)
                .Select(venue => venue.Name)
                .SingleOrDefaultAsync(ct)
            : null;

    private async Task<IReadOnlyList<string>> GroupNamesAsync(
        CalendarEntry entry,
        CancellationToken ct
    )
    {
        var groupIds = entry.ParticipatingGroups.Select(group => group.GroupId).ToList();
        if (groupIds.Count == 0)
            return [];

        var names = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => groupIds.Contains(group.Id))
            .Select(group => new { group.Id, group.Name })
            .ToListAsync(ct);

        return [.. groupIds.Join(names, id => id, group => group.Id, (_, group) => group.Name)];
    }

    [Pure]
    private static IReadOnlyList<WhatsAppPostSchedule> SchedulesOf(CalendarEntry entry) =>
        [
            .. entry
                .DaySchedules.OrderBy(schedule => schedule.Position)
                .Select(schedule => new WhatsAppPostSchedule(
                    schedule.Title,
                    [
                        .. schedule
                            .Steps.OrderBy(step => step.Day)
                            .ThenBy(step => step.Time)
                            .Select(step => new WhatsAppPostStep(step.Day, step.Time, step.Text)),
                    ]
                )),
        ];

    private sealed record AddOnPositions(
        int? AttendancePosition,
        IEnumerable<Poll> Polls,
        IEnumerable<SignUpList> SignUpLists
    );

    private sealed record TakenOverPoll(
        string Question,
        bool IsAnonymous,
        DateTimeOffset? VotesUntil
    );

    private sealed record TakenOverList(string Title, DateTimeOffset? SignUpUntil);

    private sealed record TakenOverNames(
        IReadOnlyDictionary<int, string> EntryTitles,
        IReadOnlyDictionary<int, TakenOverPoll> Polls,
        IReadOnlyDictionary<int, TakenOverList> SignUpLists
    );
}
