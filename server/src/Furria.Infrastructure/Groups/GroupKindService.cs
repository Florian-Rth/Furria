using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Groups;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Groups;

public sealed class GroupKindService
{
    private const int NoGroupKindId = 0;
    private const string UnknownKindMessage = "Diese Gruppenart gibt es nicht.";
    private const string DuplicateNameMessage = WriteConflictMessages.DuplicateGroupKind;
    private const string ArchivedKindMessage =
        "Eine archivierte Gruppenart kann nicht bearbeitet werden.";
    private const string AlreadyArchivedMessage = "Diese Gruppenart ist bereits archiviert.";
    private const string NotArchivedMessage = "Diese Gruppenart ist nicht archiviert.";
    private const string KindInUseMessage =
        "Diese Gruppenart ist in Benutzung. Ordne die Gruppen zuerst einer anderen Art zu.";

    private static readonly Expression<Func<GroupKind, KindRow>> KindProjection =
        kind => new KindRow(kind.Id, kind.Name, kind.ArchivedOn);

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public GroupKindService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<GroupKindDetails>> GetKindsAsync(CancellationToken ct)
    {
        var kinds = await OrderedKinds(_dbContext.GroupKinds.AsNoTracking())
            .Select(KindProjection)
            .ToListAsync(ct);

        var usage = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.GroupKindId != null && group.ArchivedOn == null)
            .GroupBy(group => group.GroupKindId)
            .Select(bucket => new UsageRow(bucket.Key ?? NoGroupKindId, bucket.Count()))
            .ToListAsync(ct);

        var countsByKind = usage.ToDictionary(row => row.GroupKindId, row => row.GroupCount);

        return [.. kinds.Select(kind => ToDetails(kind, CountOf(countsByKind, kind.Id)))];
    }

    public async Task<IReadOnlyList<RunningGroupKind>> GetRunningKindsAsync(CancellationToken ct) =>
        await OrderedKinds(
                _dbContext.GroupKinds.AsNoTracking().Where(kind => kind.ArchivedOn == null)
            )
            .Select(kind => new RunningGroupKind { GroupKindId = kind.Id, Name = kind.Name })
            .ToListAsync(ct);

    public async Task<Result<int>> CreateAsync(GroupKindCreateCommand command, CancellationToken ct)
    {
        if (await NameIsTakenAsync(command.Name, NoGroupKindId, ct))
            return Result<int>.Conflict(DuplicateNameMessage);

        var kind = new GroupKind { Name = command.Name };

        _dbContext.GroupKinds.Add(kind);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(kind.Id);
    }

    public async Task<Result> UpdateAsync(GroupKindUpdateCommand command, CancellationToken ct)
    {
        var kind = await TrackedKindAsync(command.GroupKindId, ct);

        if (kind is null)
            return Result.NotFound(UnknownKindMessage);

        if (kind.ArchivedOn is not null)
            return Result.Conflict(ArchivedKindMessage);

        if (await NameIsTakenAsync(command.Name, command.GroupKindId, ct))
            return Result.Conflict(DuplicateNameMessage);

        kind.Name = command.Name;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> ArchiveAsync(int groupKindId, CancellationToken ct)
    {
        var kind = await TrackedKindAsync(groupKindId, ct);

        if (kind is null)
            return Result.NotFound(UnknownKindMessage);

        if (kind.ArchivedOn is not null)
            return Result.Conflict(AlreadyArchivedMessage);

        if (await IsInUseAsync(groupKindId, ct))
            return Result.Conflict(KindInUseMessage);

        kind.ArchivedOn = ClubClock.Today(_timeProvider);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int groupKindId, CancellationToken ct)
    {
        var kind = await TrackedKindAsync(groupKindId, ct);

        if (kind is null)
            return Result.NotFound(UnknownKindMessage);

        if (kind.ArchivedOn is null)
            return Result.Conflict(NotArchivedMessage);

        if (await NameIsTakenAsync(kind.Name, groupKindId, ct))
            return Result.Conflict(DuplicateNameMessage);

        kind.ArchivedOn = null;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private Task<GroupKind?> TrackedKindAsync(int groupKindId, CancellationToken ct) =>
        _dbContext.GroupKinds.SingleOrDefaultAsync(row => row.Id == groupKindId, ct);

    private Task<bool> NameIsTakenAsync(string name, int exceptKindId, CancellationToken ct)
    {
        var lowered = name.ToLowerInvariant();

        return _dbContext
            .GroupKinds.AsNoTracking()
            .AnyAsync(
                row =>
                    row.ArchivedOn == null
                    && row.Id != exceptKindId
                    && row.Name.ToLower() == lowered,
                ct
            );
    }

    private Task<bool> IsInUseAsync(int groupKindId, CancellationToken ct) =>
        _dbContext
            .Groups.AsNoTracking()
            .AnyAsync(row => row.GroupKindId == groupKindId && row.ArchivedOn == null, ct);

    [Pure]
    private static IQueryable<GroupKind> OrderedKinds(IQueryable<GroupKind> kinds) =>
        kinds
            .OrderBy(kind => EF.Functions.Collate(kind.Name, GermanCollation.Name))
            .ThenBy(kind => kind.Id);

    [Pure]
    private static int CountOf(IReadOnlyDictionary<int, int> countsByKind, int groupKindId) =>
        countsByKind.TryGetValue(groupKindId, out var count) ? count : 0;

    [Pure]
    private static GroupKindDetails ToDetails(KindRow kind, int groupCount) =>
        new()
        {
            GroupKindId = kind.Id,
            Name = kind.Name,
            ArchivedOn = kind.ArchivedOn,
            GroupCount = groupCount,
        };

    private sealed record KindRow(int Id, string Name, DateOnly? ArchivedOn);

    private sealed record UsageRow(int GroupKindId, int GroupCount);
}
