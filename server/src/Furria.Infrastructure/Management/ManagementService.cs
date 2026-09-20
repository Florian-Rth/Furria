using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Management;

public sealed class ManagementService
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ManagementService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<ManageHubDetails> HubAsync(int accountId, CancellationToken ct)
    {
        var granted = (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(
            StringComparer.Ordinal
        );
        var today = ClubClock.Today(_timeProvider);
        var managesClub = granted.Contains(FurriaPermissions.ClubManage);

        return new ManageHubDetails
        {
            Persons = granted.Contains(FurriaPermissions.PersonsManage)
                ? await PersonsAsync(today, ct)
                : null,
            Groups = granted.Contains(FurriaPermissions.GroupsManage)
                ? await GroupsAsync(ct)
                : null,
            Roles = granted.Contains(FurriaPermissions.RolesManage)
                ? await RolesAsync(today, ct)
                : null,
            Sessions = managesClub ? await SessionsAsync(today, ct) : null,
            Venues = managesClub ? await VenuesAsync(ct) : null,
            Keys = granted.Contains(FurriaPermissions.KeyHoldingsManage)
                ? await KeysAsync(today, ct)
                : null,
            Board = granted.Contains(FurriaPermissions.BoardManage)
                ? await BoardAsync(today, ct)
                : null,
        };
    }

    private async Task<ManageHubPersons> PersonsAsync(DateOnly today, CancellationToken ct) =>
        new()
        {
            PersonCount = await _dbContext.People.CountAsync(ct),
            MemberCount = await _dbContext.People.CountAsync(
                person =>
                    person.Memberships.Any(membership =>
                        membership.StartedOn <= today
                        && (membership.EndedOn == null || membership.EndedOn >= today)
                    ),
                ct
            ),
        };

    private async Task<ManageHubGroups> GroupsAsync(CancellationToken ct) =>
        new()
        {
            GroupCount = await _dbContext.Groups.CountAsync(group => group.ArchivedOn == null, ct),
            ArchivedCount = await _dbContext.Groups.CountAsync(
                group => group.ArchivedOn != null,
                ct
            ),
        };

    private async Task<ManageHubRoles> RolesAsync(DateOnly today, CancellationToken ct)
    {
        var active = _dbContext.Roles.Where(role => role.ArchivedOn == null);

        return new ManageHubRoles
        {
            RoleCount = await active.CountAsync(ct),
            VacantCount = await active.CountAsync(
                role =>
                    !role.Holdings.Any(holding =>
                        holding.SinceOn <= today
                        && (holding.UntilOn == null || holding.UntilOn >= today)
                    ),
                ct
            ),
        };
    }

    private async Task<ManageHubSessions> SessionsAsync(DateOnly today, CancellationToken ct)
    {
        var currentStartYear = ClubSession.RelevantYearOf(today);

        return new ManageHubSessions
        {
            EntryCount = await _dbContext.Sessions.CountAsync(ct),
            CurrentStartYear = currentStartYear,
            HasCurrentEntry = await _dbContext.Sessions.AnyAsync(
                session => session.StartYear == currentStartYear,
                ct
            ),
        };
    }

    private async Task<ManageHubVenues> VenuesAsync(CancellationToken ct) =>
        new()
        {
            VenueCount = await _dbContext.Venues.CountAsync(venue => venue.ArchivedOn == null, ct),
            ArchivedCount = await _dbContext.Venues.CountAsync(
                venue => venue.ArchivedOn != null,
                ct
            ),
        };

    private async Task<ManageHubKeys> KeysAsync(DateOnly today, CancellationToken ct)
    {
        var running = _dbContext.KeyHoldings.Where(holding =>
            holding.SinceOn <= today && (holding.UntilOn == null || holding.UntilOn >= today)
        );

        return new ManageHubKeys
        {
            HoldingCount = await running.CountAsync(ct),
            HolderCount = await running
                .Select(holding => holding.PersonId)
                .Distinct()
                .CountAsync(ct),
        };
    }

    private async Task<ManageHubBoard> BoardAsync(DateOnly today, CancellationToken ct) =>
        new()
        {
            SeatCount = await _dbContext.BoardSeats.CountAsync(
                seat => seat.SinceOn <= today && (seat.UntilOn == null || seat.UntilOn >= today),
                ct
            ),
            VacantOfficeCount = await _dbContext.BoardOffices.CountAsync(
                office =>
                    office.ArchivedOn == null
                    && !_dbContext.BoardSeats.Any(seat =>
                        seat.BoardOfficeId == office.Id
                        && seat.SinceOn <= today
                        && (seat.UntilOn == null || seat.UntilOn >= today)
                    ),
                ct
            ),
        };
}
