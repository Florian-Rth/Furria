using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Authorization;

public sealed class PermissionAuthorizer
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly Dictionary<int, GroupTies> _groupTiesCache = [];

    private int? _personId;
    private bool _personResolved;
    private HashSet<string>? _grantedKeys;
    private bool? _isAffiliated;
    private bool? _canSearchPersons;

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

    public async Task<bool> IsGroupAdminAsync(int accountId, int groupId, CancellationToken ct) =>
        (await GroupTiesAsync(accountId, groupId, ct)).IsAdmin;

    public async Task<bool> IsGroupMemberOrAdminAsync(
        int accountId,
        int groupId,
        CancellationToken ct
    )
    {
        var ties = await GroupTiesAsync(accountId, groupId, ct);
        return ties.IsAdmin || ties.IsMember;
    }

    public async Task<bool> CanAdministerGroupAsync(
        int accountId,
        int groupId,
        CancellationToken ct
    ) =>
        await IsGroupAdminAsync(accountId, groupId, ct)
        || await IsGrantedAsync(accountId, FurriaPermissions.GroupsManage, ct);

    public async Task<bool> CanSearchPersonsAsync(int accountId, CancellationToken ct)
    {
        if (_canSearchPersons is not null)
            return _canSearchPersons.Value;

        var managesAnything =
            await IsGrantedAsync(accountId, FurriaPermissions.PersonsManage, ct)
            || await IsGrantedAsync(accountId, FurriaPermissions.GroupsManage, ct)
            || await IsGrantedAsync(accountId, FurriaPermissions.RolesManage, ct);

        return (
            _canSearchPersons = managesAnything || await AdministersAnyGroupAsync(accountId, ct)
        ).Value;
    }

    private async Task<bool> AdministersAnyGroupAsync(int accountId, CancellationToken ct)
    {
        var personId = await PersonIdAsync(accountId, ct);
        if (personId is null)
            return false;

        var today = ClubClock.Today(_timeProvider);
        return await _dbContext
            .GroupAdmins.AsNoTracking()
            .AnyAsync(
                admin =>
                    admin.PersonId == personId.Value
                    && admin.SinceOn <= today
                    && (admin.UntilOn == null || admin.UntilOn >= today),
                ct
            );
    }

    private async Task<GroupTies> GroupTiesAsync(int accountId, int groupId, CancellationToken ct)
    {
        if (_groupTiesCache.TryGetValue(groupId, out var cached))
            return cached;

        var personId = await PersonIdAsync(accountId, ct);
        if (personId is null)
            return _groupTiesCache[groupId] = default;

        var today = ClubClock.Today(_timeProvider);
        var ties = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId)
            .Select(group => new GroupTies(
                group.Admins.Any(admin =>
                    admin.PersonId == personId.Value
                    && admin.SinceOn <= today
                    && (admin.UntilOn == null || admin.UntilOn >= today)
                ),
                group.Memberships.Any(membership =>
                    membership.PersonId == personId.Value
                    && membership.JoinedOn <= today
                    && (membership.LeftOn == null || membership.LeftOn >= today)
                )
            ))
            .SingleOrDefaultAsync(ct);

        return _groupTiesCache[groupId] = ties;
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

    private readonly record struct GroupTies(bool IsAdmin, bool IsMember);
}
