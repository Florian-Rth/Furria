using Furria.Application.Authorization;
using Furria.Application.WhatsApp;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppSessionTracker
{
    private readonly AppDbContext _dbContext;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppSessionTracker> _logger;

    public WhatsAppSessionTracker(
        AppDbContext dbContext,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider,
        ILogger<WhatsAppSessionTracker> logger
    )
    {
        _dbContext = dbContext;
        _options = options;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task TrackAsync(InboxWhatsAppEvent statusEvent, CancellationToken ct)
    {
        if (statusEvent.Session != _options.Value.Session)
            return;
        if (WahaSessionStatuses.Parse(WahaJson.SessionStatusOf(statusEvent.Body)) is not { } status)
            return;

        var session = await LockedSessionAsync(statusEvent.Session, ct);
        if (session.StatusAt >= statusEvent.OccurredAt)
            return;

        var transition = WhatsAppSessionTransition.Of(session.WasWorking, status);
        session.Status = status;
        session.StatusAt = statusEvent.OccurredAt;
        session.WasWorking = transition.WasWorking;
        if (transition.Drops)
            await PushAdminsAsync(status, ct);

        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<WhatsAppSession> LockedSessionAsync(string name, CancellationToken ct)
    {
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO whatsapp_session (name, status, status_at, was_working)
            VALUES ({name}, {nameof(
                WhatsAppSessionStatus.Stopped
            )}, {DateTimeOffset.UnixEpoch}, false)
            ON CONFLICT (name) DO NOTHING
            """,
            ct
        );

        return await _dbContext
            .WhatsAppSessions.FromSql(
                $"SELECT * FROM whatsapp_session WHERE name = {name} FOR UPDATE"
            )
            .SingleAsync(ct);
    }

    private async Task PushAdminsAsync(WhatsAppSessionStatus status, CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var adminAccountIds = await AdminAccountIdsAsync(ClubClock.DayOf(now), ct);
        _dbContext.OutboxPushes.AddRange(
            adminAccountIds.Select(accountId => WhatsAppPushMessages.SessionDropped(accountId, now))
        );
        _logger.LogWarning(
            "WhatsApp session dropped to {SessionStatus}, {AdminCount} admins told",
            status,
            adminAccountIds.Count
        );
    }

    private Task<List<int>> AdminAccountIdsAsync(DateOnly today, CancellationToken ct)
    {
        var systemViewers = PermissionHolderQuery.PersonIdsHolding(
            _dbContext,
            FurriaPermissions.SystemView,
            today
        );

        return _dbContext
            .Users.AsNoTracking()
            .Where(account =>
                !account.IsDisabled
                && (
                    account.IsManagingLogin
                    || (account.PersonId != null && systemViewers.Contains(account.PersonId.Value))
                )
            )
            .OrderBy(account => account.Id)
            .Select(account => account.Id)
            .ToListAsync(ct);
    }
}
