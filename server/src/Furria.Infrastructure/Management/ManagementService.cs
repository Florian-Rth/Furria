using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.MembershipApplications;
using Furria.Core.Ties;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.MembershipApplications;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Management;

public sealed class ManagementService
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;
    private readonly ClubRecordService _clubRecordService;
    private readonly ToDoService _toDoService;

    public ManagementService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider,
        ClubRecordService clubRecordService,
        ToDoService toDoService
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
        _clubRecordService = clubRecordService;
        _toDoService = toDoService;
    }

    public async Task<ManageHubDetails> HubAsync(int accountId, CancellationToken ct)
    {
        var granted = (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(
            StringComparer.Ordinal
        );
        var today = ClubClock.Today(_timeProvider);
        var managesClub = granted.Contains(FurriaPermissions.ClubManage);
        var managesPersons = granted.Contains(FurriaPermissions.PersonsManage);
        var readsPersons =
            managesPersons
            || granted.Contains(FurriaPermissions.AccountsManage)
            || granted.Contains(FurriaPermissions.PersonsDelete);

        return new ManageHubDetails
        {
            Persons = readsPersons ? await PersonsAsync(today, ct) : null,
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
            ClubRecord = managesClub ? await ClubRecordAsync(ct) : null,
            Accounts = managesPersons ? await AccountsAsync(ct) : null,
            Applications = granted.Contains(FurriaPermissions.MembershipApplicationsDecide)
                ? await ApplicationsAsync(today, ct)
                : null,
            ToDos = await _toDoService.ForAsync(accountId, ct),
        };
    }

    private async Task<ManageHubApplications> ApplicationsAsync(
        DateOnly today,
        CancellationToken ct
    )
    {
        var birthDates = await _dbContext
            .UndecidedApplications()
            .Select(application => application.BirthDate)
            .ToListAsync(ct);

        return new ManageHubApplications
        {
            UndecidedCount = birthDates.Count,
            MinorCount = birthDates.Count(birthDate =>
                ApplicantBirthDate.IsMinorOn(birthDate, today)
            ),
        };
    }

    private async Task<ManageHubAccounts> AccountsAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var ageOfConsent = await _dbContext.AgeOfConsentAsync(ct);
        var withAccessCount = await CountByAccessAsync(PersonAccessFilter.WithAccess);
        var invitableCount = await _dbContext
            .EligibleWithoutAccount(ClubClock.DayOf(now), ageOfConsent)
            .CountAsync(ct);

        return new ManageHubAccounts
        {
            WithAccessCount = withAccessCount,
            OfCount = withAccessCount + invitableCount,
            OpenInvitationCount = await CountByAccessAsync(PersonAccessFilter.OpenInvitation),
            EligibleWithoutEmailCount = await CountByAccessAsync(PersonAccessFilter.WithoutEmail),
        };

        Task<int> CountByAccessAsync(PersonAccessFilter filter) =>
            _dbContext.PeopleByAccess(filter, now, ageOfConsent).CountAsync(ct);
    }

    private async Task<ManageHubClubRecord> ClubRecordAsync(CancellationToken ct)
    {
        var record = await _clubRecordService.GetAsync(ct);

        return new ManageHubClubRecord
        {
            Name = record.Name,
            MissingFactCount = ClubRecordGaps.CountOf(record),
        };
    }

    private async Task<ManageHubPersons> PersonsAsync(DateOnly today, CancellationToken ct) =>
        new()
        {
            PersonCount = await _dbContext.People.CountAsync(
                person => person.ArchivedOn == null,
                ct
            ),
            MemberCount = await _dbContext.People.CountAsync(
                person => person.Memberships.AsQueryable().Any(Running.Memberships(today)),
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
                role => !role.Holdings.AsQueryable().Any(Running.RoleHoldings(today)),
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
        var running = _dbContext.KeyHoldings.Where(Running.KeyHoldings(today));

        return new ManageHubKeys
        {
            IssuedCount = await _dbContext.KeyHoldings.CountAsync(ct),
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
            OfficeCount = await _dbContext.BoardOffices.CountAsync(
                office => office.ArchivedOn == null,
                ct
            ),
            SeatCount = await _dbContext.BoardSeats.Where(Running.BoardSeats(today)).CountAsync(ct),
            VacantOfficeCount = await _dbContext.BoardOffices.CountAsync(
                office =>
                    office.ArchivedOn == null
                    && !_dbContext
                        .BoardSeats.Where(Running.BoardSeats(today))
                        .Any(seat => seat.BoardOfficeId == office.Id),
                ct
            ),
        };
}
