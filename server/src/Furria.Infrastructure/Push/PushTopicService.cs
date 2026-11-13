using Furria.Application.Authorization;
using Furria.Application.Push;
using Furria.Core.Club;
using Furria.Core.Push;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Push;

public sealed class PushTopicService
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public PushTopicService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PushTopicSettingDetails>> GetSettingsAsync(
        int accountId,
        CancellationToken ct
    )
    {
        var personId = await _authorizer.ActivePersonIdAsync(accountId, ct);
        if (personId is not { } listenerPersonId)
            return [];

        var heard = PushTopics.HeardBy(await ListenerAsync(accountId, listenerPersonId, ct));
        var muted = await MutedTopicsAsync(accountId, ct);

        return
        [
            .. heard.Select(topic => new PushTopicSettingDetails
            {
                Topic = topic,
                IsEnabled = !muted.Contains(topic),
            }),
        ];
    }

    public async Task SwitchAsync(SwitchPushTopicCommand command, CancellationToken ct)
    {
        if (command.IsEnabled)
        {
            await _dbContext
                .MutedPushTopics.Where(muted =>
                    muted.AccountId == command.AccountId && muted.Topic == command.Topic
                )
                .ExecuteDeleteAsync(ct);
            return;
        }

        var topic = command.Topic.ToString();
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO muted_push_topic (account_id, topic)
            VALUES ({command.AccountId}, {topic})
            ON CONFLICT DO NOTHING
            """,
            ct
        );
    }

    private async Task<PushListener> ListenerAsync(
        int accountId,
        int personId,
        CancellationToken ct
    ) =>
        new()
        {
            IsCalendarAudience = await IsCalendarAudienceAsync(personId, ct),
            ReadsAnnouncements = await ReadsAnnouncementsAsync(personId, ct),
            KeepsBeerTab = await KeepsBeerTabAsync(personId, ct),
            ManagesBeerList = await _authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.BeerListManage,
                ct
            ),
        };

    private Task<bool> IsCalendarAudienceAsync(int personId, CancellationToken ct) =>
        _dbContext
            .ChoosablePersonIds(ClubClock.Today(_timeProvider))
            .AnyAsync(choosableId => choosableId == personId, ct);

    private Task<bool> ReadsAnnouncementsAsync(int personId, CancellationToken ct) =>
        _dbContext
            .AnnouncementReaderPersonIds(ClubClock.Today(_timeProvider))
            .AnyAsync(readerId => readerId == personId, ct);

    private async Task<bool> KeepsBeerTabAsync(int personId, CancellationToken ct) =>
        await _dbContext.BeerListEnrollments.AnyAsync(
            enrollment => enrollment.PersonId == personId,
            ct
        ) || await _dbContext.BeerCrates.AnyAsync(crate => crate.PersonId == personId, ct);

    private async Task<HashSet<PushTopic>> MutedTopicsAsync(int accountId, CancellationToken ct) =>
        [
            .. await _dbContext
                .MutedPushTopics.AsNoTracking()
                .Where(muted => muted.AccountId == accountId)
                .Select(muted => muted.Topic)
                .ToListAsync(ct),
        ];
}
