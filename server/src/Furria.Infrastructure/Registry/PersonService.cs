using System.Linq.Expressions;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Text;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonService
{
    private const string GermanCollation = "de-DE-x-icu";
    private const string UnknownMemberMessage = "Diese Person steht nicht im Verzeichnis.";
    private const string MissingOwnPersonMessage = "Zu diesem Konto gibt es keine Person mehr.";
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const int SearchResultLimit = 25;

    private static readonly Expression<Func<Person, MemberCardRow>> MemberCardProjection =
        person => new MemberCardRow(
            person.Id,
            person.FirstName,
            person.LastName,
            new ContactRow(
                person.ContactVisibleToMembers,
                person.Phone,
                person.Email,
                person.Street,
                person.Zip,
                person.City
            ),
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
                .GroupMemberships.Where(membership => membership.Group!.ArchivedOn == null)
                .OrderBy(membership =>
                    EF.Functions.Collate(membership.Group!.Name, GermanCollation)
                )
                .ThenBy(membership => membership.GroupId)
                .Select(membership => new TieRow(
                    membership.GroupId,
                    membership.Group!.Name,
                    membership.JoinedOn,
                    membership.LeftOn
                ))
                .ToList(),
            person
                .RoleHoldings.Where(holding => holding.Role!.ArchivedOn == null)
                .OrderBy(holding => EF.Functions.Collate(holding.Role!.Name, GermanCollation))
                .ThenBy(holding => holding.RoleId)
                .Select(holding => new TieRow(
                    holding.RoleId,
                    holding.Role!.Name,
                    holding.SinceOn,
                    holding.UntilOn
                ))
                .ToList()
        );

    private static readonly Expression<Func<Person, PersonRegistryRow>> PersonRegistryProjection =
        person => new PersonRegistryRow(
            person.Id,
            person.FirstName,
            person.LastName,
            new ContactRow(
                person.ContactVisibleToMembers,
                person.Phone,
                person.Email,
                person.Street,
                person.Zip,
                person.City
            ),
            person.BirthDate,
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
                .GroupMemberships.Where(membership => membership.Group!.ArchivedOn == null)
                .OrderBy(membership =>
                    EF.Functions.Collate(membership.Group!.Name, GermanCollation)
                )
                .ThenBy(membership => membership.GroupId)
                .Select(membership => new TieRow(
                    membership.GroupId,
                    membership.Group!.Name,
                    membership.JoinedOn,
                    membership.LeftOn
                ))
                .ToList(),
            person
                .RoleHoldings.Where(holding => holding.Role!.ArchivedOn == null)
                .OrderBy(holding => EF.Functions.Collate(holding.Role!.Name, GermanCollation))
                .ThenBy(holding => holding.RoleId)
                .Select(holding => new TieRow(
                    holding.RoleId,
                    holding.Role!.Name,
                    holding.SinceOn,
                    holding.UntilOn
                ))
                .ToList()
        );

    private static readonly MemberContact WithheldContact = new()
    {
        Visibility = ContactVisibility.Hidden,
        Phone = null,
        Email = null,
        Street = null,
        Zip = null,
        City = null,
    };

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public PersonService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
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

    public async Task<IReadOnlyList<PersonSummary>> GetAllAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .People.AsNoTracking()
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation))
            .ThenBy(person => person.Id)
            .Select(PersonRegistryProjection)
            .ToListAsync(ct);

        return [.. rows.Select(row => ToSummary(row, today))];
    }

    public async Task<Result<MemberDetails>> GetMemberAsync(
        int personId,
        int viewerAccountId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var row = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Where(AffiliationQuery.IsAffiliatedOn(today))
            .Select(MemberCardProjection)
            .SingleOrDefaultAsync(ct);

        if (row is null)
            return Result<MemberDetails>.NotFound(UnknownMemberMessage);

        var visibility = await VisibilityForAsync(row.Contact, viewerAccountId, ct);

        return Result<MemberDetails>.Success(ToDetails(row, visibility, today));
    }

    public async Task<IReadOnlyList<PersonSearchSummary>> SearchPersonsAsync(
        string query,
        CancellationToken ct
    )
    {
        var expanded = ToContainsPattern(GermanFold.Expand(query));
        var stripped = ToContainsPattern(GermanFold.Strip(query));

        return await _dbContext
            .People.AsNoTracking()
            .Where(person =>
                EF.Functions.ILike(
                    (person.FirstName + " " + person.LastName)
                        .ToLower()
                        .Replace("ä", "ae")
                        .Replace("ö", "oe")
                        .Replace("ü", "ue")
                        .Replace("ß", "ss"),
                    expanded
                )
                || EF.Functions.ILike(
                    (person.FirstName + " " + person.LastName)
                        .ToLower()
                        .Replace("ä", "a")
                        .Replace("ö", "o")
                        .Replace("ü", "u")
                        .Replace("ß", "ss"),
                    stripped
                )
            )
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation))
            .ThenBy(person => person.Id)
            .Take(SearchResultLimit)
            .Select(person => new PersonSearchSummary
            {
                PersonId = person.Id,
                FirstName = person.FirstName,
                LastName = person.LastName,
            })
            .ToListAsync(ct);
    }

    public async Task<Result<int>> CreateAsync(CreatePersonCommand command, CancellationToken ct)
    {
        var person = new Person
        {
            FirstName = command.FirstName,
            LastName = command.LastName,
            Email = command.Email,
            Phone = command.Phone,
            Street = command.Street,
            Zip = command.Zip,
            City = command.City,
            BirthDate = command.BirthDate,
            ContactVisibleToMembers = command.ContactVisibleToMembers,
        };

        _dbContext.People.Add(person);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(person.Id);
    }

    public async Task<Result> UpdateAsync(UpdatePersonCommand command, CancellationToken ct)
    {
        var person = await _dbContext.People.SingleOrDefaultAsync(
            row => row.Id == command.PersonId,
            ct
        );

        if (person is null)
            return Result.NotFound(UnknownPersonMessage);

        person.FirstName = command.FirstName;
        person.LastName = command.LastName;
        person.Email = command.Email;
        person.Phone = command.Phone;
        person.Street = command.Street;
        person.Zip = command.Zip;
        person.City = command.City;
        person.BirthDate = command.BirthDate;
        person.ContactVisibleToMembers = command.ContactVisibleToMembers;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> SetContactVisibilityAsync(
        int personId,
        bool visibleToMembers,
        CancellationToken ct
    )
    {
        var person = await _dbContext.People.SingleOrDefaultAsync(row => row.Id == personId, ct);

        if (person is null)
            return Result.NotFound(MissingOwnPersonMessage);

        person.ContactVisibleToMembers = visibleToMembers;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task<ContactVisibility> VisibilityForAsync(
        ContactRow contact,
        int viewerAccountId,
        CancellationToken ct
    )
    {
        if (contact.VisibleToMembers)
            return ContactVisibility.Shared;

        var revealed = await _authorizer.IsGrantedAsync(
            viewerAccountId,
            FurriaPermissions.PersonsReadDetails,
            ct
        );

        return revealed ? ContactVisibility.RevealedByPermission : ContactVisibility.Hidden;
    }

    private static MemberDetails ToDetails(
        MemberCardRow row,
        ContactVisibility visibility,
        DateOnly today
    )
    {
        var chain = MembershipChainDetails.Of(ToPeriods(row.Memberships, today), today);

        return new MemberDetails
        {
            PersonId = row.Id,
            FirstName = row.FirstName,
            LastName = row.LastName,
            MembershipState = chain.State,
            MemberSince = chain.MemberSince,
            Groups =
            [
                .. RunningTies(row.Groups, today)
                    .Select(tie => new MemberGroup
                    {
                        GroupId = tie.Id,
                        Name = tie.Name,
                        Since = tie.Since,
                    }),
            ],
            Roles =
            [
                .. RunningTies(row.Roles, today)
                    .Select(tie => new MemberRole
                    {
                        RoleId = tie.Id,
                        Name = tie.Name,
                        Since = tie.Since,
                    }),
            ],
            Contact = ToContact(row.Contact, visibility),
        };
    }

    private static MemberContact ToContact(ContactRow row, ContactVisibility visibility) =>
        visibility == ContactVisibility.Hidden
            ? WithheldContact
            : new MemberContact
            {
                Visibility = visibility,
                Phone = row.Phone,
                Email = row.Email,
                Street = row.Street,
                Zip = row.Zip,
                City = row.City,
            };

    private static IReadOnlyList<TieSince> RunningTies(
        IReadOnlyList<TieRow> rows,
        DateOnly today
    ) =>
        [
            .. rows.GroupBy(row => row.Id)
                .Where(tie => tie.Any(row => IsRunningOn(row, today)))
                .Select(tie => new TieSince(
                    tie.Key,
                    tie.First().Name,
                    tie.Min(row => row.StartedOn)
                )),
        ];

    private static bool IsRunningOn(TieRow row, DateOnly today) =>
        new DatePeriod { Start = row.StartedOn, End = row.EndedOn }.IsRunningOn(today);

    private static PersonSummary ToSummary(PersonRegistryRow row, DateOnly today)
    {
        var chain = MembershipChainDetails.Of(ToPeriods(row.Memberships, today), today);

        return new PersonSummary
        {
            PersonId = row.Id,
            FirstName = row.FirstName,
            LastName = row.LastName,
            Email = row.Contact.Email,
            Phone = row.Contact.Phone,
            Street = row.Contact.Street,
            Zip = row.Contact.Zip,
            City = row.Contact.City,
            BirthDate = row.BirthDate,
            ContactVisibleToMembers = row.Contact.VisibleToMembers,
            MembershipState = chain.State,
            MemberSince = chain.MemberSince,
            Groups =
            [
                .. RunningTies(row.Groups, today)
                    .Select(tie => new GroupReference { GroupId = tie.Id, Name = tie.Name }),
            ],
            Roles =
            [
                .. RunningTies(row.Roles, today)
                    .Select(tie => new RoleReference { RoleId = tie.Id, Name = tie.Name }),
            ],
        };
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

    private static string ToContainsPattern(string folded) =>
        "%"
        + folded
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace("%", "\\%", StringComparison.Ordinal)
            .Replace("_", "\\_", StringComparison.Ordinal)
        + "%";

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

    private sealed record PersonRegistryRow(
        int Id,
        string FirstName,
        string LastName,
        ContactRow Contact,
        DateOnly? BirthDate,
        IReadOnlyList<MembershipRow> Memberships,
        IReadOnlyList<TieRow> Groups,
        IReadOnlyList<TieRow> Roles
    );

    private sealed record MemberCardRow(
        int Id,
        string FirstName,
        string LastName,
        ContactRow Contact,
        IReadOnlyList<MembershipRow> Memberships,
        IReadOnlyList<TieRow> Groups,
        IReadOnlyList<TieRow> Roles
    );

    private sealed record ContactRow(
        bool VisibleToMembers,
        string? Phone,
        string? Email,
        string? Street,
        string? Zip,
        string? City
    );

    private sealed record TieRow(int Id, string Name, DateOnly StartedOn, DateOnly? EndedOn);

    private sealed record TieSince(int Id, string Name, DateOnly Since);
}
