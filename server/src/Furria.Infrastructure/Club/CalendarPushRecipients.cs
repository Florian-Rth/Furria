using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Infrastructure.Club;

public sealed class CalendarPushRecipients
{
    private readonly AppDbContext _dbContext;
    private readonly IServiceScopeFactory _scopeFactory;

    public CalendarPushRecipients(AppDbContext dbContext, IServiceScopeFactory scopeFactory)
    {
        _dbContext = dbContext;
        _scopeFactory = scopeFactory;
    }

    public async Task<IReadOnlyList<CalendarPushRecipient>> ReachedAsync(
        CalendarPushReach reach,
        CancellationToken ct
    )
    {
        var candidates = (await CandidatesAsync(reach, ct))
            .Where(candidate => !reach.SkippedPersonIds.Contains(candidate.PersonId))
            .ToList();
        var tiesByPerson = await _dbContext.CalendarTiesOfManyAsync(
            [.. candidates.Select(candidate => candidate.PersonId)],
            reach.Today,
            ct
        );

        var reached = new List<CalendarPushRecipient>();
        foreach (var candidate in candidates)
        {
            var ties = tiesByPerson[candidate.PersonId];
            if (
                CalendarPushRules.MayConcern(reach.Reason, reach.Entry, ties)
                && ties.Sees(reach.Entry, await RightsOfAsync(candidate.AccountId, ct))
            )
                reached.Add(candidate);
        }

        return reached;
    }

    private Task<List<CalendarPushRecipient>> CandidatesAsync(
        CalendarPushReach reach,
        CancellationToken ct
    )
    {
        var accounts = _dbContext.PushableAccounts(CalendarPushRules.TopicOf(reach.Reason));

        if (reach.ActorPersonId is { } actorPersonId)
            accounts = accounts.Where(account => account.PersonId != actorPersonId);

        if (!CalendarPushRules.ReachesEveryoneConcerned(reach.Reason))
        {
            var personIds = reach.AddressedPersonIds;
            accounts = accounts.Where(account => personIds.Contains(account.PersonId!.Value));
        }

        return accounts
            .OrderBy(account => account.Id)
            .Select(account => new CalendarPushRecipient(account.Id, account.PersonId!.Value))
            .ToListAsync(ct);
    }

    private async Task<CalendarRights> RightsOfAsync(int accountId, CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var authorizer = scope.ServiceProvider.GetRequiredService<PermissionAuthorizer>();

        return new CalendarRights(
            HoldsClubRead: await authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.ClubRead,
                ct
            ),
            ManagesClubCalendar: await authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.CalendarManageClub,
                ct
            )
        );
    }
}
