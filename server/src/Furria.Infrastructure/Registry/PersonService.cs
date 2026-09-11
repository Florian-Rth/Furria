using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonService
{
    private const string GermanCollation = "de-DE-x-icu";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PersonService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<MemberSummary>> GetMembersAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .People.AsNoTracking()
            .Where(AffiliationQuery.IsAffiliatedOn(today))
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation))
            .ThenBy(person => person.Id)
            .Select(person => new MemberRow(
                person.Id,
                person.FirstName,
                person.LastName,
                person
                    .Memberships.Select(membership => new MembershipRow(
                        membership.Id,
                        membership.StartedOn,
                        membership.EndedOn,
                        membership
                            .Pauses.Select(pause => new MembershipPauseDetails
                            {
                                PauseId = pause.Id,
                                FirstSessionYear = pause.FirstSessionYear,
                                LastSessionYear = pause.LastSessionYear,
                            })
                            .ToList()
                    ))
                    .ToList(),
                person
                    .GroupMemberships.Where(membership =>
                        membership.JoinedOn <= today
                        && (membership.LeftOn == null || membership.LeftOn >= today)
                        && membership.Group!.ArchivedOn == null
                    )
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Group!.Name, GermanCollation)
                    )
                    .ThenBy(membership => membership.GroupId)
                    .Select(membership => new GroupReference
                    {
                        GroupId = membership.GroupId,
                        Name = membership.Group!.Name,
                    })
                    .ToList(),
                person
                    .RoleHoldings.Where(holding =>
                        holding.SinceOn <= today
                        && (holding.UntilOn == null || holding.UntilOn >= today)
                        && holding.Role!.ArchivedOn == null
                    )
                    .OrderBy(holding => EF.Functions.Collate(holding.Role!.Name, GermanCollation))
                    .ThenBy(holding => holding.RoleId)
                    .Select(holding => new RoleReference
                    {
                        RoleId = holding.RoleId,
                        Name = holding.Role!.Name,
                    })
                    .ToList()
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, today))];
    }

    private static MemberSummary ToSummary(MemberRow row, DateOnly today) =>
        new()
        {
            PersonId = row.Id,
            FirstName = row.FirstName,
            LastName = row.LastName,
            MembershipState = MembershipChainDetails
                .Of(ToPeriods(row.Memberships, today), today)
                .State,
            Groups = [.. row.Groups.DistinctBy(group => group.GroupId)],
            Roles = [.. row.Roles.DistinctBy(role => role.RoleId)],
        };

    private static IReadOnlyList<MembershipDetails> ToPeriods(
        IReadOnlyList<MembershipRow> rows,
        DateOnly today
    ) =>
        [
            .. rows.Select(row =>
                MembershipDetails.Of(row.Id, row.StartedOn, row.EndedOn, row.Pauses, today)
            ),
        ];

    private sealed record MemberRow(
        int Id,
        string FirstName,
        string LastName,
        IReadOnlyList<MembershipRow> Memberships,
        IReadOnlyList<GroupReference> Groups,
        IReadOnlyList<RoleReference> Roles
    );

    private sealed record MembershipRow(
        int Id,
        DateOnly StartedOn,
        DateOnly? EndedOn,
        IReadOnlyList<MembershipPauseDetails> Pauses
    );
}
