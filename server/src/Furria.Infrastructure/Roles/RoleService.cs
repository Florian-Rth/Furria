using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Results;
using Furria.Application.Roles;
using Furria.Core.Club;
using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Roles;

public sealed class RoleService
{
    private const int NoRoleId = 0;
    private const string UnknownRoleMessage = "Diese Rolle gibt es nicht.";
    private const string DuplicateNameMessage = WriteConflictMessages.DuplicateRollenName;
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle kann nicht bearbeitet werden.";
    private const string AlreadyArchivedMessage = "Diese Rolle ist bereits archiviert.";
    private const string NotArchivedMessage = "Diese Rolle ist nicht archiviert.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string OpenHoldingMessage = WriteConflictMessages.OpenInhaberschaft;
    private const string OverlappingHoldingMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Inhaberschaft. "
        + "Eine erneute Inhaberschaft beginnt frühestens am Tag nach dem Ende der vorigen.";
    private const string UnknownHoldingMessage =
        "Diese Inhaberschaft gibt es bei dieser Rolle nicht.";
    private const string EndedHoldingMessage = "Diese Inhaberschaft ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Eine Inhaberschaft kann nicht vor ihrem Beginn enden.";

    private static readonly Expression<Func<Role, RolePageRow>> RolePageProjection =
        role => new RolePageRow(
            role.Id,
            role.Name,
            role.Description,
            role.ArchivedOn,
            role.Permissions.OrderBy(permission => permission.PermissionKey)
                .Select(permission => permission.PermissionKey)
                .ToList(),
            role.Holdings.OrderBy(holding =>
                    EF.Functions.Collate(holding.Person!.LastName, GermanCollation.Name)
                )
                .ThenBy(holding =>
                    EF.Functions.Collate(holding.Person!.FirstName, GermanCollation.Name)
                )
                .ThenBy(holding => holding.PersonId)
                .ThenBy(holding => holding.SinceOn)
                .ThenBy(holding => holding.Id)
                .Select(holding => new HoldingRow(
                    holding.Id,
                    holding.PersonId,
                    holding.Person!.FirstName,
                    holding.Person!.LastName,
                    holding.SinceOn,
                    holding.UntilOn
                ))
                .ToList()
        );

    private readonly AppDbContext _dbContext;
    private readonly AffiliationLookup _affiliationLookup;
    private readonly TimeProvider _timeProvider;

    public RoleService(
        AppDbContext dbContext,
        AffiliationLookup affiliationLookup,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _affiliationLookup = affiliationLookup;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<RoleSummary>> GetRolesAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Roles.AsNoTracking()
            .OrderBy(role => EF.Functions.Collate(role.Name, GermanCollation.Name))
            .ThenBy(role => role.Id)
            .Select(RolePageProjection)
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, today))];
    }

    public async Task<IReadOnlyList<RoleOverviewSummary>> GetRolesOverviewAsync(
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Roles.AsNoTracking()
            .Where(role => role.ArchivedOn == null)
            .OrderBy(role => EF.Functions.Collate(role.Name, GermanCollation.Name))
            .ThenBy(role => role.Id)
            .Select(RolePageProjection)
            .ToListAsync(ct);

        return [.. rows.Select(row => ToOverview(row, today))];
    }

    public async Task<Result<RoleDetails>> GetRoleAsync(int roleId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .Roles.AsNoTracking()
            .Where(role => role.Id == roleId)
            .Select(RolePageProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<RoleDetails>.NotFound(UnknownRoleMessage);

        var affiliated = await _affiliationLookup.AffiliatedAmongAsync(
            [.. row.Holdings.Select(holding => holding.PersonId)],
            today,
            ct
        );

        return Result<RoleDetails>.Success(ToDetails(row, today, affiliated));
    }

    public async Task<Result<int>> CreateAsync(CreateRoleCommand command, CancellationToken ct)
    {
        if (await NameIsTakenAsync(command.Name, NoRoleId, ct))
            return Result<int>.Conflict(DuplicateNameMessage);

        var role = new Role { Name = command.Name, Description = command.Description };

        _dbContext.Roles.Add(role);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(role.Id);
    }

    public async Task<Result> UpdateAsync(UpdateRoleCommand command, CancellationToken ct)
    {
        var role = await TrackedRoleAsync(command.RoleId, ct);

        if (role is null)
            return Result.NotFound(UnknownRoleMessage);

        if (role.ArchivedOn is not null)
            return Result.Conflict(ArchivedRoleMessage);

        if (await NameIsTakenAsync(command.Name, command.RoleId, ct))
            return Result.Conflict(DuplicateNameMessage);

        role.Name = command.Name;
        role.Description = command.Description;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> ArchiveAsync(int roleId, CancellationToken ct)
    {
        var role = await TrackedRoleAsync(roleId, ct);

        if (role is null)
            return Result.NotFound(UnknownRoleMessage);

        if (role.ArchivedOn is not null)
            return Result.Conflict(AlreadyArchivedMessage);

        role.ArchivedOn = ClubClock.Today(_timeProvider);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int roleId, CancellationToken ct)
    {
        var role = await TrackedRoleAsync(roleId, ct);

        if (role is null)
            return Result.NotFound(UnknownRoleMessage);

        if (role.ArchivedOn is null)
            return Result.Conflict(NotArchivedMessage);

        if (await NameIsTakenAsync(role.Name, roleId, ct))
            return Result.Conflict(DuplicateNameMessage);

        role.ArchivedOn = null;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> SetPermissionsAsync(
        SetRolePermissionsCommand command,
        CancellationToken ct
    )
    {
        var role = await _dbContext
            .Roles.Include(row => row.Permissions)
            .SingleOrDefaultAsync(row => row.Id == command.RoleId, ct);

        if (role is null)
            return Result.NotFound(UnknownRoleMessage);

        if (role.ArchivedOn is not null)
            return Result.Conflict(ArchivedRoleMessage);

        ReplacePermissions(role, command.PermissionKeys);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<int>> AddHoldingAsync(
        AddRoleHoldingCommand command,
        CancellationToken ct
    )
    {
        var role = await RoleStateAsync(command.RoleId, ct);

        if (role is null)
            return Result<int>.NotFound(UnknownRoleMessage);

        if (role.ArchivedOn is not null)
            return Result<int>.Conflict(ArchivedRoleMessage);

        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var chain = await ChainOfAsync(command.RoleId, command.PersonId, ct);

        if (HasOpenRow(chain))
            return Result<int>.Conflict(OpenHoldingMessage);

        if (OverlapsChain(chain, command.SinceOn))
            return Result<int>.Conflict(OverlappingHoldingMessage);

        var holding = new RoleHolding
        {
            RoleId = command.RoleId,
            PersonId = command.PersonId,
            SinceOn = command.SinceOn,
        };

        _dbContext.RoleHoldings.Add(holding);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(holding.Id);
    }

    public async Task<Result> EndHoldingAsync(EndRoleHoldingCommand command, CancellationToken ct)
    {
        var holding = await _dbContext.RoleHoldings.SingleOrDefaultAsync(
            row => row.Id == command.RoleHoldingId && row.RoleId == command.RoleId,
            ct
        );

        if (holding is null)
            return Result.NotFound(UnknownHoldingMessage);

        if (holding.UntilOn is not null)
            return Result.Conflict(EndedHoldingMessage);

        if (command.EndedOn < holding.SinceOn)
            return Result.Validation(EndBeforeStartMessage);

        holding.UntilOn = command.EndedOn;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private static void ReplacePermissions(Role role, IReadOnlyList<string> permissionKeys)
    {
        var desired = permissionKeys.ToHashSet(StringComparer.Ordinal);
        var granted = role.Permissions.ToList();

        foreach (var permission in granted.Where(row => !desired.Contains(row.PermissionKey)))
        {
            role.Permissions.Remove(permission);
        }

        var missing = desired.Where(key =>
            granted.TrueForAll(row =>
                !string.Equals(row.PermissionKey, key, StringComparison.Ordinal)
            )
        );

        foreach (var key in missing)
        {
            role.Permissions.Add(new RolePermission { PermissionKey = key });
        }
    }

    private Task<Role?> TrackedRoleAsync(int roleId, CancellationToken ct) =>
        _dbContext.Roles.SingleOrDefaultAsync(row => row.Id == roleId, ct);

    private Task<RoleState?> RoleStateAsync(int roleId, CancellationToken ct) =>
        _dbContext
            .Roles.AsNoTracking()
            .Where(row => row.Id == roleId)
            .Select(row => new RoleState(row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private Task<bool> NameIsTakenAsync(string name, int exceptRoleId, CancellationToken ct)
    {
        var lowered = name.ToLowerInvariant();

        return _dbContext
            .Roles.AsNoTracking()
            .AnyAsync(
                row =>
                    row.ArchivedOn == null
                    && row.Id != exceptRoleId
                    && row.Name.ToLower() == lowered,
                ct
            );
    }

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    private Task<List<PeriodRow>> ChainOfAsync(int roleId, int personId, CancellationToken ct) =>
        _dbContext
            .RoleHoldings.AsNoTracking()
            .Where(row => row.RoleId == roleId && row.PersonId == personId)
            .Select(row => new PeriodRow(row.SinceOn, row.UntilOn))
            .ToListAsync(ct);

    [Pure]
    private static bool HasOpenRow(IReadOnlyList<PeriodRow> chain) =>
        chain.Any(row => row.UntilOn is null);

    [Pure]
    private static bool OverlapsChain(IReadOnlyList<PeriodRow> chain, DateOnly sinceOn)
    {
        var opened = new DatePeriod { Start = sinceOn, End = null };
        return chain.Any(row => opened.Overlaps(row.AsPeriod));
    }

    private static RoleSummary ToSummary(RolePageRow row, DateOnly today) =>
        new()
        {
            RoleId = row.Id,
            Name = row.Name,
            Description = row.Description,
            ArchivedOn = row.ArchivedOn,
            PermissionKeys = row.PermissionKeys,
            Holders =
            [
                .. RunningRows(row.Holdings, today)
                    .DistinctBy(holding => holding.PersonId)
                    .Select(holding => new RoleHolderReference
                    {
                        PersonId = holding.PersonId,
                        FirstName = holding.FirstName,
                        LastName = holding.LastName,
                    }),
            ],
        };

    private static RoleOverviewSummary ToOverview(RolePageRow row, DateOnly today) =>
        new()
        {
            RoleId = row.Id,
            Name = row.Name,
            Description = row.Description,
            Holders =
            [
                .. RunningRows(row.Holdings, today)
                    .DistinctBy(holding => holding.PersonId)
                    .Select(ToOverviewHolder),
            ],
        };

    private static RoleOverviewHolder ToOverviewHolder(HoldingRow holding) =>
        new()
        {
            PersonId = holding.PersonId,
            FirstName = holding.FirstName,
            LastName = holding.LastName,
            SinceOn = holding.SinceOn,
        };

    private static RoleDetails ToDetails(
        RolePageRow row,
        DateOnly today,
        IReadOnlySet<int> affiliated
    )
    {
        var chainStarts = ChainStarts(row.Holdings);

        return new RoleDetails
        {
            RoleId = row.Id,
            Name = row.Name,
            Description = row.Description,
            ArchivedOn = row.ArchivedOn,
            PermissionKeys = row.PermissionKeys,
            Holders =
            [
                .. RunningRows(row.Holdings, today)
                    .Select(holding =>
                        ToHolder(holding, chainStarts[holding.PersonId], affiliated)
                    ),
            ],
            PastHolders =
            [
                .. EndedRows(row.Holdings, today)
                    .Select(holding =>
                        ToHolder(holding, chainStarts[holding.PersonId], affiliated)
                    ),
            ],
        };
    }

    private static RoleHolder ToHolder(
        HoldingRow holding,
        DateOnly since,
        IReadOnlySet<int> affiliated
    ) =>
        new()
        {
            RoleHoldingId = holding.RowId,
            PersonId = holding.PersonId,
            FirstName = holding.FirstName,
            LastName = holding.LastName,
            SinceOn = holding.SinceOn,
            UntilOn = holding.UntilOn,
            Since = since,
            IsAffiliated = affiliated.Contains(holding.PersonId),
        };

    private static IEnumerable<HoldingRow> RunningRows(
        IReadOnlyList<HoldingRow> rows,
        DateOnly today
    ) => rows.Where(row => IsRunningOn(row, today));

    private static IEnumerable<HoldingRow> EndedRows(
        IReadOnlyList<HoldingRow> rows,
        DateOnly today
    ) =>
        rows.Where(row => row.UntilOn is { } untilOn && untilOn < today)
            .OrderByDescending(row => row.SinceOn)
            .ThenByDescending(row => row.RowId);

    private static bool IsRunningOn(HoldingRow row, DateOnly today) =>
        new DatePeriod { Start = row.SinceOn, End = row.UntilOn }.IsRunningOn(today);

    private static IReadOnlyDictionary<int, DateOnly> ChainStarts(IReadOnlyList<HoldingRow> rows) =>
        rows.GroupBy(row => row.PersonId)
            .ToDictionary(chain => chain.Key, chain => chain.Min(row => row.SinceOn));

    private sealed record RolePageRow(
        int Id,
        string Name,
        string Description,
        DateOnly? ArchivedOn,
        IReadOnlyList<string> PermissionKeys,
        IReadOnlyList<HoldingRow> Holdings
    );

    private sealed record HoldingRow(
        int RowId,
        int PersonId,
        string FirstName,
        string LastName,
        DateOnly SinceOn,
        DateOnly? UntilOn
    );

    private sealed record RoleState(DateOnly? ArchivedOn);

    private sealed record PeriodRow(DateOnly SinceOn, DateOnly? UntilOn)
    {
        [Pure]
        public DatePeriod AsPeriod => new() { Start = SinceOn, End = UntilOn };
    }
}
