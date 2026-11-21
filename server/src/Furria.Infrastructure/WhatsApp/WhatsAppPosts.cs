using System.Diagnostics.Contracts;
using System.Globalization;
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
    private const string AnnouncementPath = "/announcements";
    private const string CalendarPath = "/calendar";

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

        var post = WhatsAppPostText.Render(
            new WhatsAppPostDraft
            {
                Title = announcement.Title,
                Slot = null,
                Body = WhatsAppPostBody.Rich(announcement.Body),
                MentionablePhones = await MentionablePhonesAsync(announcement.Mentions, ct),
                Schedules = [],
                GroupNames = [],
                AuthorName = await NameOfAsync(announcement.AuthorPersonId, ct),
                Link = LinkOf(AnnouncementPath, announcement.Id),
            }
        );
        Stage(chatId, WhatsAppHostKind.Announcement, announcement.Id, post);
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

        var post = WhatsAppPostText.Render(
            new WhatsAppPostDraft
            {
                Title = entry.Title,
                Slot = new WhatsAppPostSlot(
                    entry.StartsAt,
                    entry.EndsAt,
                    await VenueNameAsync(entry.VenueId, ct)
                ),
                Body = entry.Description is { } description
                    ? WhatsAppPostBody.Plain(description)
                    : null,
                MentionablePhones = new Dictionary<int, string>(),
                Schedules = SchedulesOf(entry),
                GroupNames = await GroupNamesAsync(entry, ct),
                AuthorName = await NameOfAsync(authorPersonId, ct),
                Link = LinkOf(CalendarPath, entry.Id),
            }
        );
        Stage(chatId, WhatsAppHostKind.CalendarEntry, entry.Id, post);
        await _dbContext.SaveChangesAsync(ct);
    }

    private void Stage(
        string chatId,
        WhatsAppHostKind hostKind,
        int hostId,
        WhatsAppPostContent post
    ) =>
        _dbContext.OutboxWhatsApps.Add(
            new OutboxWhatsApp
            {
                ChatId = chatId,
                Operation = WhatsAppOperation.PostText,
                HostKind = hostKind,
                HostId = hostId,
                Text = post.Text,
                Mentions = [.. post.MentionedChatIds],
                EnqueuedAt = _timeProvider.GetUtcNow(),
            }
        );

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

    private string LinkOf(string path, int id) =>
        string.Create(
            CultureInfo.InvariantCulture,
            $"{_clubApp.Value.BaseUrl.TrimEnd('/')}{path}/{id}"
        );

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
}
