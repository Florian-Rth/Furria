using Furria.Core.BeerList;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.BeerList;

public sealed class BeerTabReminderService
{
    private readonly AppDbContext _dbContext;
    private readonly PushSender _pushSender;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<BeerTabReminderService> _logger;

    public BeerTabReminderService(
        AppDbContext dbContext,
        PushSender pushSender,
        TimeProvider timeProvider,
        ILogger<BeerTabReminderService> logger
    )
    {
        _dbContext = dbContext;
        _pushSender = pushSender;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task RemindDueTabsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        if (!BeerListNoticeSchedule.IsSendingTime(now))
            return;

        var openTabs = await OpenTabsAsync(ct);
        var lastReminders = await LastRemindersAsync(ct);
        var dueTabs = openTabs.Where(tab =>
            BeerListNoticeSchedule.IsTabReminderDue(
                tab.OldestOpenCrateBookedAt,
                lastReminders.TryGetValue(tab.PersonId, out var sentAt) ? sentAt : null,
                now
            )
        );

        foreach (var tab in dueTabs)
            await RemindAsync(tab, now, ct);
    }

    private async Task RemindAsync(OpenTab tab, DateTimeOffset now, CancellationToken ct)
    {
        await RecordReminderAsync(tab.PersonId, now, ct);

        var message = BeerListPushes.TabReminder(tab.OpenCrates, tab.OpenCents);
        var delivered = 0;
        foreach (var accountId in await AccountsOfAsync(tab.PersonId, ct))
            delivered += (await _pushSender.SendAsync(accountId, message, ct)).Delivered;

        _logger.LogInformation(
            "Beer tab reminder for person {PersonId} reached {DeliveredDevices} devices",
            tab.PersonId,
            delivered
        );
    }

    private Task RecordReminderAsync(int personId, DateTimeOffset sentAt, CancellationToken ct) =>
        _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO beer_tab_reminder (person_id, sent_at) VALUES ({personId}, {sentAt})
            ON CONFLICT (person_id) DO UPDATE SET sent_at = excluded.sent_at
            """,
            ct
        );

    private async Task<IReadOnlyList<OpenTab>> OpenTabsAsync(CancellationToken ct) =>
        await BeerPotLedger
            .OpenCrates(_dbContext)
            .Where(crate => crate.PersonId != null)
            .GroupBy(crate => crate.PersonId!.Value)
            .Select(crates => new OpenTab(
                crates.Key,
                crates.Min(crate => crate.BookedAt),
                crates.Count(),
                crates.Sum(crate => crate.PriceCents)
            ))
            .ToListAsync(ct);

    private Task<Dictionary<int, DateTimeOffset>> LastRemindersAsync(CancellationToken ct) =>
        _dbContext
            .BeerTabReminders.AsNoTracking()
            .ToDictionaryAsync(reminder => reminder.PersonId, reminder => reminder.SentAt, ct);

    private Task<List<int>> AccountsOfAsync(int personId, CancellationToken ct) =>
        _dbContext
            .Users.AsNoTracking()
            .Where(account => account.PersonId == personId && !account.IsDisabled)
            .Select(account => account.Id)
            .ToListAsync(ct);

    private sealed record OpenTab(
        int PersonId,
        DateTimeOffset OldestOpenCrateBookedAt,
        int OpenCrates,
        int OpenCents
    );
}
