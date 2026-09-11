using System.Linq.Expressions;
using Furria.Application.Groups;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Groups;

public sealed class GroupService
{
    private const string GermanCollation = "de-DE-x-icu";
    private const int MemberPreviewSize = 5;
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht mehr im Verzeichnis.";

    private static readonly Expression<Func<Group, GroupPageRow>> GroupPageProjection =
        group => new GroupPageRow(
            group.Id,
            group.Name,
            group.Description,
            group.IsRecruiting,
            group
                .Memberships.OrderBy(membership =>
                    EF.Functions.Collate(membership.Person!.LastName, GermanCollation)
                )
                .ThenBy(membership =>
                    EF.Functions.Collate(membership.Person!.FirstName, GermanCollation)
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
                    EF.Functions.Collate(admin.Person!.LastName, GermanCollation)
                )
                .ThenBy(admin => EF.Functions.Collate(admin.Person!.FirstName, GermanCollation))
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
    private readonly TimeProvider _timeProvider;

    public GroupService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<GroupSummary>> GetGroupsAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation))
            .ThenBy(group => group.Id)
            .Select(group => new GroupCardRow(
                group.Id,
                group.Name,
                group.Description,
                group.IsRecruiting,
                group
                    .Memberships.Where(membership =>
                        membership.JoinedOn <= today
                        && (membership.LeftOn == null || membership.LeftOn >= today)
                    )
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Person!.LastName, GermanCollation)
                    )
                    .ThenBy(membership =>
                        EF.Functions.Collate(membership.Person!.FirstName, GermanCollation)
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
                    .OrderBy(admin => EF.Functions.Collate(admin.Person!.LastName, GermanCollation))
                    .ThenBy(admin => EF.Functions.Collate(admin.Person!.FirstName, GermanCollation))
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

    public async Task<IReadOnlyList<MyGroupSummary>> GetMyGroupsAsync(
        int personId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        return await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.ArchivedOn == null)
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation))
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

    public async Task<Result<MyGroupDetails>> GetMyGroupAsync(int groupId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId && group.ArchivedOn == null)
            .Select(GroupPageProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<MyGroupDetails>.NotFound(UnknownGroupMessage);

        return Result<MyGroupDetails>.Success(ToHubDetails(row, today));
    }

    public async Task<Result<GroupDetails>> GetGroupAsync(int groupId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .Groups.AsNoTracking()
            .Where(group => group.Id == groupId && group.ArchivedOn == null)
            .Select(GroupPageProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<GroupDetails>.NotFound(UnknownGroupMessage);

        return Result<GroupDetails>.Success(ToDetails(row, today));
    }

    private static MyGroupDetails ToHubDetails(GroupPageRow row, DateOnly today)
    {
        var memberChains = ChainStarts(row.Members);
        var adminChains = ChainStarts(row.Admins);

        return new MyGroupDetails
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            Members =
            [
                .. RunningRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId])),
            ],
            Admins =
            [
                .. RunningRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId])),
            ],
            PastMembers =
            [
                .. EndedRows(row.Members, today)
                    .Select(tie => ToHubMember(tie, memberChains[tie.PersonId])),
            ],
            PastAdmins =
            [
                .. EndedRows(row.Admins, today)
                    .Select(tie => ToHubAdministrator(tie, adminChains[tie.PersonId])),
            ],
        };
    }

    private static HubMember ToHubMember(TieRow tie, DateOnly since) =>
        new()
        {
            GroupMembershipId = tie.RowId,
            PersonId = tie.PersonId,
            FirstName = tie.FirstName,
            LastName = tie.LastName,
            JoinedOn = tie.StartedOn,
            LeftOn = tie.EndedOn,
            Since = since,
        };

    private static HubAdministrator ToHubAdministrator(TieRow tie, DateOnly since) =>
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

    private static GroupDetails ToDetails(GroupPageRow row, DateOnly today) =>
        new()
        {
            GroupId = row.Id,
            Name = row.Name,
            Description = row.Description,
            IsRecruiting = row.IsRecruiting,
            Members =
            [
                .. RunningTies(row.Members, today)
                    .Select(tie => new GroupMember
                    {
                        PersonId = tie.PersonId,
                        FirstName = tie.FirstName,
                        LastName = tie.LastName,
                        Since = tie.Since,
                    }),
            ],
            Admins =
            [
                .. RunningTies(row.Admins, today)
                    .Select(tie => new GroupAdministrator
                    {
                        PersonId = tie.PersonId,
                        FirstName = tie.FirstName,
                        LastName = tie.LastName,
                        Function = tie.Function,
                        Since = tie.Since,
                    }),
            ],
        };

    private static IReadOnlyList<PersonTie> RunningTies(
        IReadOnlyList<TieRow> rows,
        DateOnly today
    ) =>
        [
            .. rows.GroupBy(row => row.PersonId)
                .Where(chain => chain.Any(row => IsRunningOn(row, today)))
                .Select(chain => new PersonTie(
                    chain.Key,
                    chain.First().FirstName,
                    chain.First().LastName,
                    CurrentFunction(chain, today),
                    chain.Min(row => row.StartedOn)
                )),
        ];

    private static string? CurrentFunction(IEnumerable<TieRow> chain, DateOnly today) =>
        chain.Last(row => IsRunningOn(row, today)).Function;

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
            MemberCount = members.Count,
            MemberPreview = [.. members.Take(MemberPreviewSize)],
            Admins = OnePerPerson(row.Admins),
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
        IReadOnlyList<PersonReference> Members,
        IReadOnlyList<PersonReference> Admins
    );

    private sealed record GroupPageRow(
        int Id,
        string Name,
        string Description,
        bool IsRecruiting,
        IReadOnlyList<TieRow> Members,
        IReadOnlyList<TieRow> Admins
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

    private sealed record PersonTie(
        int PersonId,
        string FirstName,
        string LastName,
        string? Function,
        DateOnly Since
    );
}
