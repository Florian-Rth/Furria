using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Groups;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Groups;

public sealed class GroupService
{
    private const int MemberPreviewSize = 5;
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht mehr im Verzeichnis.";
    private const string ArchivedGroupMessage =
        "Eine archivierte Gruppe kann nicht bearbeitet werden.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string UnknownGroupKindMessage = "Diese Gruppenart gibt es nicht.";
    private const string FutureFoundedYearMessage =
        "Eine Gruppe kann nicht in der Zukunft gegründet worden sein.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string ArchivedVenueMessage =
        "Ein archivierter Ort kann nicht mehr gewählt werden.";
    private const string DuplicateNameMessage = WriteConflictMessages.DuplicateGruppenName;
    private const string AlreadyArchivedMessage = "Diese Gruppe ist bereits archiviert.";
    private const string NotArchivedMessage = "Diese Gruppe ist nicht archiviert.";
    private const string UnknownZugehoerigkeitMessage =
        "Diese Zugehörigkeit gibt es in dieser Gruppe nicht.";
    private const string EndedZugehoerigkeitMessage = "Diese Zugehörigkeit ist bereits beendet.";
    private const string EndBeforeStartMessage =
        "Eine Zugehörigkeit kann nicht vor ihrem Beginn enden.";
    private const string OpenZugehoerigkeitMessage = WriteConflictMessages.OpenZugehoerigkeit;
    private const string OverlappingZugehoerigkeitMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Zugehörigkeit. "
        + "Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Zugehörigkeit.";

    private const string OpenErnennungMessage = WriteConflictMessages.OpenErnennung;
    private const string EndedErnennungMessage = "Diese Ernennung ist bereits beendet.";
    private const string EndBeforeErnennungMessage =
        "Eine Ernennung kann nicht vor ihrem Beginn enden.";
    private const string UnknownErnennungMessage =
        "Diese Ernennung gibt es in dieser Gruppe nicht.";
    private const string OverlappingErnennungMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Ernennung. "
        + "Eine erneute Ernennung beginnt frühestens am Tag nach dem Ende der vorigen.";

    private static readonly Expression<Func<Group, GroupPageRow>> GroupPageProjection =
        group => new GroupPageRow(
            group.Id,
            group.Name,
            group.Description,
            group.IsRecruiting,
            group.GroupKindId,
            group.GroupKind!.Name,
            group.FoundedYear,
            group.Tone,
            group.ArchivedOn,
            group
                .TrainingSlots.OrderBy(slot => slot.Weekday)
                .ThenBy(slot => slot.StartsAt)
                .ThenBy(slot => slot.Id)
                .Select(slot => new SlotRow(
                    slot.Id,
                    slot.Weekday,
                    slot.StartsAt,
                    slot.DurationMinutes,
                    slot.VenueId,
                    slot.Venue!.Name
                ))
                .ToList(),
            group
                .Memberships.OrderBy(membership =>
                    EF.Functions.Collate(membership.Person!.LastName, GermanCollation.Name)
                )
                .ThenBy(membership =>
                    EF.Functions.Collate(membership.Person!.FirstName, GermanCollation.Name)
                )
                .ThenBy(membership => membership.PersonId)
                .ThenBy(membership => membership.JoinedOn)
                .ThenBy(membership => membership.Id)
                .Select(membership => new TieRow(
                    membership.Id,
                    membership.PersonId,
                    membership.Person!.FirstName,
                    membership.Person!.LastName,
                    null,
                    membership.JoinedOn,
                    membership.LeftOn
                ))
                .ToList(),
            group
                .Admins.OrderBy(admin =>
                    EF.Functions.Collate(admin.Person!.LastName, GermanCollation.Name)
                )
                .ThenBy(admin =>
                    EF.Functions.Collate(admin.Person!.FirstName, GermanCollation.Name)
                )
                .ThenBy(admin => admin.PersonId)
                .ThenBy(admin => admin.SinceOn)
                .ThenBy(admin => admin.Id)
                .Select(admin => new TieRow(
                    admin.Id,
                    admin.PersonId,
                    admin.Person!.FirstName,
                    admin.Person!.LastName,
                    admin.Function,
                    admin.SinceOn,
                    admin.UntilOn
                ))
                .ToList()
        );

    private readonly AppDbContext _dbContext;
    private readonly AffiliationLookup _affiliationLookup;
    private readonly TimeProvider _timeProvider;

    public GroupService(
        AppDbContext dbContext,
        AffiliationLookup affiliationLookup,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _affiliationLookup = affiliationLookup;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<GroupSummary>> GetGroupsAsync(
        int viewerPersonId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new GroupCardRow(
                group.Id,
                group.Name,
                group.Description,
                group.IsRecruiting,
                group.GroupKind!.Name,
                group.FoundedYear,
                group.Tone,
                group.Memberships.Any(membership =>
                    membership.PersonId == viewerPersonId
                    && membership.JoinedOn <= today
                    && (membership.LeftOn == null || membership.LeftOn >= today)
                ),
                group.Admins.Any(admin =>
                    admin.PersonId == viewerPersonId
                    && admin.SinceOn <= today
                    && (admin.UntilOn == null || admin.UntilOn >= today)
                ),
                group
                    .Memberships.Where(membership =>
                        membership.JoinedOn <= today
                        && (membership.LeftOn == null || membership.LeftOn >= today)
                    )
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Person!.LastName, GermanCollation.Name)
                    )
                    .ThenBy(membership =>
                        EF.Functions.Collate(membership.Person!.FirstName, GermanCollation.Name)
                    )
                    .ThenBy(membership => membership.PersonId)
                    .Select(membership => new PersonReference
                    {
                        PersonId = membership.PersonId,
                        FirstName = membership.Person!.FirstName,
                        LastName = membership.Person!.LastName,
                    })
                    .ToList(),
                group
                    .Admins.Where(admin =>
                        admin.SinceOn <= today && (admin.UntilOn == null || admin.UntilOn >= today)
                    )
                    .OrderBy(admin =>
                        EF.Functions.Collate(admin.Person!.LastName, GermanCollation.Name)
                    )
                    .ThenBy(admin =>
                        EF.Functions.Collate(admin.Person!.FirstName, GermanCollation.Name)
                    )
                    .ThenBy(admin => admin.PersonId)
                    .Select(admin => new PersonReference
                    {
                        PersonId = admin.PersonId,
                        FirstName = admin.Person!.FirstName,
                        LastName = admin.Person!.LastName,
                    })
                    .ToList()
            ))
            .ToListAsync(ct);

        return [.. rows.Select(ToSummary)];
    }

    public async Task<IReadOnlyList<PublicGroupSummary>> GetPublicGroupsAsync(
        CancellationToken ct
    ) =>
        await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new PublicGroupSummary
            {
                GroupId = group.Id,
                Name = group.Name,
                Description = group.Description,
                IsRecruiting = group.IsRecruiting,
                GroupKindName = group.GroupKind!.Name,
                Tone = group.Tone,
            })
            .ToListAsync(ct);

    public async Task<IReadOnlyList<MyGroupSummary>> GetMyGroupsAsync(
        int personId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        return await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new MyGroupSummary
            {
                GroupId = group.Id,
                Name = group.Name,
                IsMember = group.Memberships.Any(membership =>
                    membership.PersonId == personId
                    && membership.JoinedOn <= today
                    && (membership.LeftOn == null || membership.LeftOn >= today)
                ),
                IsAdmin = group.Admins.Any(admin =>
                    admin.PersonId == personId
                    && admin.SinceOn <= today
                    && (admin.UntilOn == null || admin.UntilOn >= today)
                ),
            })
            .Where(group => group.IsMember || group.IsAdmin)
            .ToListAsync(ct);
    }

    public async Task<Result<GroupDetails>> GetGroupAsync(
        int groupId,
        int? viewerPersonId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId && group.ArchivedOn == null)
            .Select(GroupPageProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<GroupDetails>.NotFound(UnknownGroupMessage);

        var affiliated = await AffiliatedAmongAsync(row, today, ct);

        return Result<GroupDetails>.Success(ToHubDetails(row, today, affiliated, viewerPersonId));
    }

    public async Task<IReadOnlyList<ManagedGroupSummary>> GetManagedGroupsAsync(
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Groups.AsNoTracking()
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(group => new ManagedGroupRow(
                group.Id,
                group.Name,
                group.Description,
                group.IsRecruiting,
                group.GroupKindId,
                group.GroupKind!.Name,
                group.ArchivedOn,
                group
                    .Memberships.Where(membership =>
                        membership.JoinedOn <= today
                        && (membership.LeftOn == null || membership.LeftOn >= today)
                    )
                    .Select(membership => new PersonReference
                    {
                        PersonId = membership.PersonId,
                        FirstName = membership.Person!.FirstName,
                        LastName = membership.Person!.LastName,
                    })
                    .ToList(),
                group
                    .Admins.Where(admin =>
                        admin.SinceOn <= today && (admin.UntilOn == null || admin.UntilOn >= today)
                    )
                    .OrderBy(admin =>
                        EF.Functions.Collate(admin.Person!.LastName, GermanCollation.Name)
                    )
                    .ThenBy(admin =>
                        EF.Functions.Collate(admin.Person!.FirstName, GermanCollation.Name)
                    )
                    .ThenBy(admin => admin.PersonId)
                    .Select(admin => new PersonReference
                    {
                        PersonId = admin.PersonId,
                        FirstName = admin.Person!.FirstName,
                        LastName = admin.Person!.LastName,
                    })
                    .ToList()
            ))
            .ToListAsync(ct);

        return [.. rows.Select(ToManagedSummary)];
    }

    public async Task<Result<ManagedGroupDetails>> GetManagedGroupAsync(
        int groupId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId)
            .Select(GroupPageProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<ManagedGroupDetails>.NotFound(UnknownGroupMessage);

        var affiliated = await AffiliatedAmongAsync(row, today, ct);

        return Result<ManagedGroupDetails>.Success(ToManagedDetails(row, today, affiliated));
    }

    public async Task<Result<int>> CreateAsync(CreateGroupCommand command, CancellationToken ct)
    {
        if (await NameIsTakenAsync(command.Name, null, ct))
            return Result<int>.Conflict(DuplicateNameMessage);

        if (!await GroupKindExistsAsync(command.GroupKindId, ct))
            return Result<int>.NotFound(UnknownGroupKindMessage);

        var group = new Group
        {
            Name = command.Name,
            Description = command.Description,
            IsRecruiting = command.IsRecruiting,
            GroupKindId = command.GroupKindId,
        };

        _dbContext.Groups.Add(group);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(group.Id);
    }

    public async Task<Result> UpdateAsync(UpdateGroupCommand command, CancellationToken ct)
    {
        var group = await _dbContext.Groups.SingleOrDefaultAsync(
            row => row.Id == command.GroupId,
            ct
        );

        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result.Conflict(ArchivedGroupMessage);

        if (await NameIsTakenAsync(command.Name, command.GroupId, ct))
            return Result.Conflict(DuplicateNameMessage);

        if (!await GroupKindExistsAsync(command.GroupKindId, ct))
            return Result.NotFound(UnknownGroupKindMessage);

        group.Name = command.Name;
        group.Description = command.Description;
        group.IsRecruiting = command.IsRecruiting;
        group.GroupKindId = command.GroupKindId;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> ArchiveAsync(int groupId, CancellationToken ct)
    {
        var group = await _dbContext.Groups.SingleOrDefaultAsync(row => row.Id == groupId, ct);

        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result.Conflict(AlreadyArchivedMessage);

        group.ArchivedOn = ClubClock.Today(_timeProvider);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RestoreAsync(int groupId, CancellationToken ct)
    {
        var group = await _dbContext.Groups.SingleOrDefaultAsync(row => row.Id == groupId, ct);

        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is null)
            return Result.Conflict(NotArchivedMessage);

        if (await NameIsTakenAsync(group.Name, groupId, ct))
            return Result.Conflict(DuplicateNameMessage);

        group.ArchivedOn = null;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> UpdateInfoAsync(UpdateGroupInfoCommand command, CancellationToken ct)
    {
        var group = await _dbContext.Groups.SingleOrDefaultAsync(
            row => row.Id == command.GroupId,
            ct
        );

        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result.Conflict(ArchivedGroupMessage);

        if (!await GroupKindExistsAsync(command.GroupKindId, ct))
            return Result.NotFound(UnknownGroupKindMessage);

        if (IsInTheFuture(command.FoundedYear, ClubClock.Today(_timeProvider)))
            return Result.Validation(FutureFoundedYearMessage);

        group.Description = command.Description;
        group.IsRecruiting = command.IsRecruiting;
        group.GroupKindId = command.GroupKindId;
        group.FoundedYear = command.FoundedYear;
        group.Tone = command.Tone;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> SetTrainingSlotsAsync(
        SetGroupTrainingSlotsCommand command,
        CancellationToken ct
    )
    {
        var group = await GroupStateAsync(command.GroupId, ct);

        if (group is null)
            return Result.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result.Conflict(ArchivedGroupMessage);

        if (await VenueRefusalAsync(command.Slots, ct) is { } refusal)
            return refusal;

        var current = await _dbContext
            .GroupTrainingSlots.Where(slot => slot.GroupId == command.GroupId)
            .ToListAsync(ct);

        _dbContext.GroupTrainingSlots.RemoveRange(current);
        _dbContext.GroupTrainingSlots.AddRange(
            command.Slots.Select(slot => ToSlot(command.GroupId, slot))
        );

        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<int>> AddMembershipAsync(
        AddGroupMembershipCommand command,
        CancellationToken ct
    )
    {
        var group = await GroupStateAsync(command.GroupId, ct);

        if (group is null)
            return Result<int>.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result<int>.Conflict(ArchivedGroupMessage);

        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var chain = await ChainOfAsync(command.GroupId, command.PersonId, ct);

        if (HasOpenRow(chain))
            return Result<int>.Conflict(OpenZugehoerigkeitMessage);

        if (OverlapsChain(chain, command.JoinedOn))
            return Result<int>.Conflict(OverlappingZugehoerigkeitMessage);

        var membership = new GroupMembership
        {
            GroupId = command.GroupId,
            PersonId = command.PersonId,
            JoinedOn = command.JoinedOn,
        };

        _dbContext.GroupMemberships.Add(membership);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(membership.Id);
    }

    public async Task<Result> EndMembershipAsync(
        EndGroupMembershipCommand command,
        CancellationToken ct
    )
    {
        var membership = await _dbContext
            .GroupMemberships.Include(row => row.Group)
            .SingleOrDefaultAsync(
                row => row.Id == command.GroupMembershipId && row.GroupId == command.GroupId,
                ct
            );

        if (membership is null)
            return Result.NotFound(UnknownZugehoerigkeitMessage);

        if (membership.Group!.ArchivedOn is not null)
            return Result.Conflict(ArchivedGroupMessage);

        if (membership.LeftOn is not null)
            return Result.Conflict(EndedZugehoerigkeitMessage);

        if (command.EndedOn < membership.JoinedOn)
            return Result.Validation(EndBeforeStartMessage);

        membership.LeftOn = command.EndedOn;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<int>> AddAdminAsync(AddGroupAdminCommand command, CancellationToken ct)
    {
        var group = await GroupStateAsync(command.GroupId, ct);

        if (group is null)
            return Result<int>.NotFound(UnknownGroupMessage);

        if (group.ArchivedOn is not null)
            return Result<int>.Conflict(ArchivedGroupMessage);

        if (!await PersonExistsAsync(command.PersonId, ct))
            return Result<int>.NotFound(UnknownPersonMessage);

        var chain = await AdminChainOfAsync(command.GroupId, command.PersonId, ct);

        if (HasOpenRow(chain))
            return Result<int>.Conflict(OpenErnennungMessage);

        if (OverlapsChain(chain, command.SinceOn))
            return Result<int>.Conflict(OverlappingErnennungMessage);

        var admin = new GroupAdmin
        {
            GroupId = command.GroupId,
            PersonId = command.PersonId,
            Function = command.Function,
            SinceOn = command.SinceOn,
        };

        _dbContext.GroupAdmins.Add(admin);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(admin.Id);
    }

    public async Task<Result> EndAdminAsync(EndGroupAdminCommand command, CancellationToken ct)
    {
        var admin = await _dbContext
            .GroupAdmins.Include(row => row.Group)
            .SingleOrDefaultAsync(
                row => row.Id == command.GroupAdminId && row.GroupId == command.GroupId,
                ct
            );

        if (admin is null)
            return Result.NotFound(UnknownErnennungMessage);

        if (admin.Group!.ArchivedOn is not null)
            return Result.Conflict(ArchivedGroupMessage);

        if (admin.UntilOn is not null)
            return Result.Conflict(EndedErnennungMessage);

        if (command.EndedOn < admin.SinceOn)
            return Result.Validation(EndBeforeErnennungMessage);

        admin.UntilOn = command.EndedOn;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private Task<IReadOnlySet<int>> AffiliatedAmongAsync(
        GroupPageRow row,
        DateOnly today,
        CancellationToken ct
    ) =>
        _affiliationLookup.AffiliatedAmongAsync(
            [.. row.Members.Select(tie => tie.PersonId), .. row.Admins.Select(tie => tie.PersonId)],
            today,
            ct
        );

    private Task<GroupState?> GroupStateAsync(int groupId, CancellationToken ct) =>
        _dbContext
            .Groups.AsNoTracking()
            .Where(row => row.Id == groupId)
            .Select(row => new GroupState(row.ArchivedOn))
            .SingleOrDefaultAsync(ct);

    private Task<bool> NameIsTakenAsync(string name, int? exceptGroupId, CancellationToken ct)
    {
        var lowered = name.ToLowerInvariant();

        return _dbContext
            .Groups.AsNoTracking()
            .AnyAsync(
                row =>
                    row.ArchivedOn == null
                    && row.Id != exceptGroupId
                    && row.Name.ToLower() == lowered,
                ct
            );
    }

    private async Task<bool> GroupKindExistsAsync(int? groupKindId, CancellationToken ct) =>
        groupKindId is not { } kindId
        || await _dbContext.GroupKinds.AsNoTracking().AnyAsync(kind => kind.Id == kindId, ct);

    private async Task<Result?> VenueRefusalAsync(
        IReadOnlyList<GroupTrainingSlotInput> slots,
        CancellationToken ct
    )
    {
        var wanted = slots.Select(slot => slot.VenueId).OfType<int>().Distinct().ToList();

        if (wanted.Count == 0)
            return null;

        var found = await _dbContext
            .Venues.AsNoTracking()
            .Where(venue => wanted.Contains(venue.Id))
            .Select(venue => new VenueStateRow(venue.Id, venue.ArchivedOn))
            .ToListAsync(ct);

        if (found.Count != wanted.Count)
            return Result.NotFound(UnknownVenueMessage);

        return found.Any(venue => venue.ArchivedOn is not null)
            ? Result.Conflict(ArchivedVenueMessage)
            : null;
    }

    private Task<bool> PersonExistsAsync(int personId, CancellationToken ct) =>
        _dbContext.People.AsNoTracking().AnyAsync(row => row.Id == personId, ct);

    private Task<List<PeriodRow>> AdminChainOfAsync(
        int groupId,
        int personId,
        CancellationToken ct
    ) =>
        _dbContext
            .GroupAdmins.AsNoTracking()
            .Where(row => row.GroupId == groupId && row.PersonId == personId)
            .Select(row => new PeriodRow(row.SinceOn, row.UntilOn))
            .ToListAsync(ct);

    private Task<List<PeriodRow>> ChainOfAsync(int groupId, int personId, CancellationToken ct) =>
        _dbContext
            .GroupMemberships.AsNoTracking()
            .Where(row => row.GroupId == groupId && row.PersonId == personId)
            .Select(row => new PeriodRow(row.JoinedOn, row.LeftOn))
            .ToListAsync(ct);

    [Pure]
    private static bool IsInTheFuture(int? foundedYear, DateOnly today) =>
        foundedYear is { } year && year > today.Year;

    [Pure]
    private static GroupTrainingSlot ToSlot(int groupId, GroupTrainingSlotInput input) =>
        new()
        {
            GroupId = groupId,
            VenueId = input.VenueId,
            Weekday = input.Weekday,
            StartsAt = input.StartsAt,
            DurationMinutes = input.DurationMinutes,
        };

    [Pure]
    private static bool HasOpenRow(IReadOnlyList<PeriodRow> chain) =>
        chain.Any(row => row.EndedOn is null);

    [Pure]
    private static bool OverlapsChain(IReadOnlyList<PeriodRow> chain, DateOnly joinedOn)
    {
        var joined = new DatePeriod { Start = joinedOn, End = null };
        return chain.Any(row => joined.Overlaps(row.AsPeriod));
    }

    [Pure]
    private static bool HasRunningRow(IReadOnlyList<TieRow> rows, int? personId, DateOnly today) =>
        personId is { } viewerId
        && rows.Any(row => row.PersonId == viewerId && IsRunningOn(row, today));

    [Pure]
    private static DateOnly? ChainStartOf(
        IReadOnlyDictionary<int, DateOnly> chains,
        int? personId
    ) => personId is { } viewerId && chains.TryGetValue(viewerId, out var since) ? since : null;

    [Pure]
    private static GroupTrainingSlotDetails ToSlotDetails(SlotRow slot) =>
        new()
        {
            GroupTrainingSlotId = slot.Id,
            Weekday = slot.Weekday,
            StartsAt = slot.StartsAt,
            DurationMinutes = slot.DurationMinutes,
            VenueId = slot.VenueId,
            VenueName = slot.VenueName,
        };

    private static GroupDetails ToHubDetails(
        GroupPageRow row,
        DateOnly today,
        IReadOnlySet<int> affiliated,
        int? viewerPersonId
    )
    {
        var memberChains = ChainStarts(row.Members);
        var adminChains = ChainStarts(row.Admins);
        var viewerIsMember = HasRunningRow(row.Members, viewerPersonId, today);

        return new GroupDetails
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            GroupKindId = row.GroupKindId,
            GroupKindName = row.GroupKindName,
            FoundedYear = row.FoundedYear,
            Tone = row.Tone,
            TrainingSlots = [.. row.TrainingSlots.Select(ToSlotDetails)],
            Admins =
            [
                .. RunningRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId], affiliated)),
            ],
            Members =
            [
                .. RunningRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId], affiliated)),
            ],
            ViewerIsMember = viewerIsMember,
            ViewerIsAdmin = HasRunningRow(row.Admins, viewerPersonId, today),
            ViewerSince = viewerIsMember ? ChainStartOf(memberChains, viewerPersonId) : null,
            PastMembers =
            [
                .. EndedRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId], affiliated)),
            ],
            PastAdmins =
            [
                .. EndedRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId], affiliated)),
            ],
        };
    }

    private static ManagedGroupDetails ToManagedDetails(
        GroupPageRow row,
        DateOnly today,
        IReadOnlySet<int> affiliated
    )
    {
        var memberChains = ChainStarts(row.Members);
        var adminChains = ChainStarts(row.Admins);

        return new ManagedGroupDetails
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            GroupKindId = row.GroupKindId,
            GroupKindName = row.GroupKindName,
            ArchivedOn = row.ArchivedOn,
            Members =
            [
                .. RunningRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId], affiliated)),
            ],
            Admins =
            [
                .. RunningRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId], affiliated)),
            ],
            PastMembers =
            [
                .. EndedRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId], affiliated)),
            ],
            PastAdmins =
            [
                .. EndedRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId], affiliated)),
            ],
        };
    }

    private static ManagedGroupSummary ToManagedSummary(ManagedGroupRow row) =>
        new()
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            GroupKindId = row.GroupKindId,
            GroupKindName = row.GroupKindName,
            ArchivedOn = row.ArchivedOn,
            MemberCount = OnePerPerson(row.Members).Count,
            Admins = OnePerPerson(row.Admins),
        };

    private static HubMember ToHubMember(
        TieRow tie,
        DateOnly since,
        IReadOnlySet<int> affiliated
    ) =>
        new()
        {
            GroupMembershipId = tie.RowId,
            PersonId = tie.PersonId,
            FirstName = tie.FirstName,
            LastName = tie.LastName,
            JoinedOn = tie.StartedOn,
            LeftOn = tie.EndedOn,
            Since = since,
            IsAffiliated = affiliated.Contains(tie.PersonId),
        };

    private static HubAdministrator ToHubAdministrator(
        TieRow tie,
        DateOnly since,
        IReadOnlySet<int> affiliated
    ) =>
        new()
        {
            GroupAdminId = tie.RowId,
            PersonId = tie.PersonId,
            FirstName = tie.FirstName,
            LastName = tie.LastName,
            Function = tie.Function,
            SinceOn = tie.StartedOn,
            UntilOn = tie.EndedOn,
            Since = since,
            IsAffiliated = affiliated.Contains(tie.PersonId),
        };

    private static IEnumerable<TieRow> RunningRows(IReadOnlyList<TieRow> rows, DateOnly today) =>
        rows.Where(row => IsRunningOn(row, today));

    private static IEnumerable<TieRow> EndedRows(IReadOnlyList<TieRow> rows, DateOnly today) =>
        rows.Where(row => row.EndedOn is { } endedOn && endedOn < today)
            .OrderByDescending(row => row.StartedOn)
            .ThenByDescending(row => row.RowId);

    private static IReadOnlyDictionary<int, DateOnly> ChainStarts(IReadOnlyList<TieRow> rows) =>
        rows.GroupBy(row => row.PersonId)
            .ToDictionary(chain => chain.Key, chain => chain.Min(row => row.StartedOn));

    private static bool IsRunningOn(TieRow row, DateOnly today) =>
        new DatePeriod { Start = row.StartedOn, End = row.EndedOn }.IsRunningOn(today);

    private static GroupSummary ToSummary(GroupCardRow row)
    {
        var members = OnePerPerson(row.Members);

        return new GroupSummary
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            GroupKindName = row.GroupKindName,
            FoundedYear = row.FoundedYear,
            Tone = row.Tone,
            MemberCount = members.Count,
            MemberPreview = [.. members.Take(MemberPreviewSize)],
            Admins = OnePerPerson(row.Admins),
            ViewerIsMember = row.ViewerIsMember,
            ViewerIsAdmin = row.ViewerIsAdmin,
        };
    }

    private static IReadOnlyList<PersonReference> OnePerPerson(
        IReadOnlyList<PersonReference> people
    ) => [.. people.DistinctBy(person => person.PersonId)];

    private sealed record GroupCardRow(
        int Id,
        string Name,
        string Description,
        bool IsRecruiting,
        string? GroupKindName,
        int? FoundedYear,
        GroupTone? Tone,
        bool ViewerIsMember,
        bool ViewerIsAdmin,
        IReadOnlyList<PersonReference> Members,
        IReadOnlyList<PersonReference> Admins
    );

    private sealed record GroupPageRow(
        int Id,
        string Name,
        string Description,
        bool IsRecruiting,
        int? GroupKindId,
        string? GroupKindName,
        int? FoundedYear,
        GroupTone? Tone,
        DateOnly? ArchivedOn,
        IReadOnlyList<SlotRow> TrainingSlots,
        IReadOnlyList<TieRow> Members,
        IReadOnlyList<TieRow> Admins
    );

    private sealed record SlotRow(
        int Id,
        DayOfWeek Weekday,
        TimeOnly StartsAt,
        int DurationMinutes,
        int? VenueId,
        string? VenueName
    );

    private sealed record ManagedGroupRow(
        int Id,
        string Name,
        string Description,
        bool IsRecruiting,
        int? GroupKindId,
        string? GroupKindName,
        DateOnly? ArchivedOn,
        IReadOnlyList<PersonReference> Members,
        IReadOnlyList<PersonReference> Admins
    );

    private sealed record TieRow(
        int RowId,
        int PersonId,
        string FirstName,
        string LastName,
        string? Function,
        DateOnly StartedOn,
        DateOnly? EndedOn
    );

    private sealed record GroupState(DateOnly? ArchivedOn);

    private sealed record VenueStateRow(int Id, DateOnly? ArchivedOn);

    private sealed record PeriodRow(DateOnly StartedOn, DateOnly? EndedOn)
    {
        public DatePeriod AsPeriod => new() { Start = StartedOn, End = EndedOn };
    }
}
