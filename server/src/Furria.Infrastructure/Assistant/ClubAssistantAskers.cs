using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantAskers
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantAskers(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<ClubAssistantAsker?> OfAsync(int personId, CancellationToken ct)
    {
        var firstName = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Where(AffiliationQuery.IsAffiliatedOn(ClubClock.Today(_timeProvider)))
            .Select(person => person.FirstName)
            .SingleOrDefaultAsync(ct);
        if (firstName is null)
            return null;

        return new ClubAssistantAsker(
            personId,
            firstName,
            await GroupNamesOfAsync(personId, ct),
            await _authorizer.GrantedKeysOfPersonAsync(personId, ct)
        );
    }

    private async Task<IReadOnlyList<string>> GroupNamesOfAsync(int personId, CancellationToken ct)
    {
        var tiedGroupIds = _dbContext.TiedGroupIds(personId, ClubClock.Today(_timeProvider));
        return await _dbContext
            .Groups.AsNoTracking()
            .Where(group => tiedGroupIds.Contains(group.Id))
            .OrderBy(group => group.Name)
            .Select(group => group.Name)
            .ToListAsync(ct);
    }
}
