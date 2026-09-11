using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Authorization;

public sealed class PermissionAuthorizer
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    private int? _personId;
    private bool _personResolved;
    private HashSet<string>? _grantedKeys;
    private bool? _isAffiliated;

    public PermissionAuthorizer(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<bool> IsGrantedAsync(
        int accountId,
        string permissionKey,
        CancellationToken ct
    ) => (await GrantedKeysAsync(accountId, ct)).Contains(permissionKey);

    public async Task<IReadOnlyCollection<string>> GrantedKeysAsync(
        int accountId,
        CancellationToken ct
    )
    {
        if (_grantedKeys is not null)
            return _grantedKeys;

        var personId = await PersonIdAsync(accountId, ct);
        if (personId is null)
            return _grantedKeys = [];

        var today = ClubClock.Today(_timeProvider);
        var keys = await _dbContext
            .RoleHoldings.AsNoTracking()
            .Where(holding =>
                holding.PersonId == personId.Value
                && holding.SinceOn <= today
                && (holding.UntilOn == null || holding.UntilOn >= today)
                && holding.Role!.ArchivedOn == null
            )
            .SelectMany(holding => holding.Role!.Permissions.Select(row => row.PermissionKey))
            .Distinct()
            .ToListAsync(ct);

        return _grantedKeys = keys.ToHashSet(StringComparer.Ordinal);
    }

    public async Task<bool> IsAffiliatedAsync(int accountId, CancellationToken ct)
    {
        if (_isAffiliated is not null)
            return _isAffiliated.Value;

        var personId = await PersonIdAsync(accountId, ct);
        if (personId is null)
            return (_isAffiliated = false).Value;

        var today = ClubClock.Today(_timeProvider);
        return (
            _isAffiliated = await _dbContext
                .People.AsNoTracking()
                .Where(person => person.Id == personId.Value)
                .AnyAsync(AffiliationQuery.IsAffiliatedOn(today), ct)
        ).Value;
    }

    private async Task<int?> PersonIdAsync(int accountId, CancellationToken ct)
    {
        if (_personResolved)
            return _personId;

        _personResolved = true;
        _personId = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId && !account.IsDisabled)
            .Select(account => (int?)account.PersonId)
            .SingleOrDefaultAsync(ct);

        return _personId;
    }
}
