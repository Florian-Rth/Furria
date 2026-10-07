using System.Diagnostics.Contracts;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonArchiveService
{
    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string RunningLead =
        "Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: ";
    private const string RunningSeparator = " · ";
    private const string MembershipLabel = "Mitgliedschaft";
    private const string GroupLabel = "Gruppe";
    private const string RoleLabel = "Rolle";
    private const string GroupAdminLabel = "Gruppen-Admin";
    private const string BoardSeatLabel = "Vorstandssitz";
    private const string KeyHoldingLabel = "Schlüssel";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PersonArchiveService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<Result> SetArchivedAsync(PersonArchiveCommand command, CancellationToken ct)
    {
        var person = await _dbContext.People.SingleOrDefaultAsync(
            row => row.Id == command.PersonId,
            ct
        );

        if (person is null)
            return Result.NotFound(UnknownPersonMessage);

        if (IsArchived(person) == command.IsArchived)
            return Result.Success();

        return command.IsArchived
            ? await ArchiveAsync(person, command.ActorPersonId, ct)
            : await RestoreAsync(person, ct);
    }

    private async Task<Result> ArchiveAsync(Person person, int? actorPersonId, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);
        var running = await RunningTiesOfAsync(person.Id, today, ct);

        if (running.Count > 0)
            return Result.Conflict(RefusalNaming(running));

        person.ArchivedOn = today;
        person.ArchivedByPersonId = actorPersonId;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task<Result> RestoreAsync(Person person, CancellationToken ct)
    {
        person.LiftArchive();
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private async Task<IReadOnlyList<string>> RunningTiesOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    )
    {
        var row = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .Select(person => new UnendedTiesRow(
                person.Memberships.Any(membership =>
                    membership.EndedOn == null || membership.EndedOn >= today
                ),
                person
                    .GroupMemberships.Where(membership =>
                        (membership.LeftOn == null || membership.LeftOn >= today)
                        && membership.Group!.ArchivedOn == null
                    )
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Group!.Name, GermanCollation.Name)
                    )
                    .ThenBy(membership => membership.GroupId)
                    .Select(membership => membership.Group!.Name)
                    .ToList(),
                person
                    .RoleHoldings.Where(holding =>
                        (holding.UntilOn == null || holding.UntilOn >= today)
                        && holding.Role!.ArchivedOn == null
                    )
                    .OrderBy(holding =>
                        EF.Functions.Collate(holding.Role!.Name, GermanCollation.Name)
                    )
                    .ThenBy(holding => holding.RoleId)
                    .Select(holding => holding.Role!.Name)
                    .ToList(),
                person
                    .GroupAdminships.Where(tenure =>
                        (tenure.UntilOn == null || tenure.UntilOn >= today)
                        && tenure.Group!.ArchivedOn == null
                    )
                    .OrderBy(tenure =>
                        EF.Functions.Collate(tenure.Group!.Name, GermanCollation.Name)
                    )
                    .ThenBy(tenure => tenure.GroupId)
                    .Select(tenure => tenure.Group!.Name)
                    .ToList(),
                _dbContext
                    .BoardSeats.Where(seat =>
                        seat.PersonId == person.Id
                        && (seat.UntilOn == null || seat.UntilOn >= today)
                        && seat.BoardOffice!.ArchivedOn == null
                    )
                    .OrderBy(seat => seat.BoardOffice!.SortOrder)
                    .ThenBy(seat =>
                        EF.Functions.Collate(seat.BoardOffice!.Name, GermanCollation.Name)
                    )
                    .ThenBy(seat => seat.BoardOfficeId)
                    .Select(seat => seat.BoardOffice!.Name)
                    .ToList(),
                _dbContext
                    .KeyHoldings.Where(holding =>
                        holding.PersonId == person.Id
                        && (holding.UntilOn == null || holding.UntilOn >= today)
                    )
                    .OrderBy(holding => holding.Venue!.SortOrder)
                    .ThenBy(holding =>
                        EF.Functions.Collate(holding.Venue!.Name, GermanCollation.Name)
                    )
                    .ThenBy(holding => holding.VenueId)
                    .Select(holding => holding.Venue!.Name)
                    .ToList()
            ))
            .SingleAsync(ct);

        return RunningTiesOf(row);
    }

    [Pure]
    private static bool IsArchived(Person person) => person.ArchivedOn is not null;

    [Pure]
    private static IReadOnlyList<string> RunningTiesOf(UnendedTiesRow row) =>
        [
            .. row.HasUnendedMembership ? [MembershipLabel] : Array.Empty<string>(),
            .. Labelled(GroupLabel, row.GroupNames),
            .. Labelled(RoleLabel, row.RoleNames),
            .. Labelled(GroupAdminLabel, row.GroupAdminNames),
            .. Labelled(BoardSeatLabel, row.BoardOfficeNames),
            .. Labelled(KeyHoldingLabel, row.VenueNames),
        ];

    [Pure]
    private static IEnumerable<string> Labelled(string label, IReadOnlyList<string> names) =>
        names.Distinct(StringComparer.Ordinal).Select(name => $"{label} {name}");

    [Pure]
    private static string RefusalNaming(IReadOnlyList<string> running) =>
        $"{RunningLead}{string.Join(RunningSeparator, running)}.";

    private sealed record UnendedTiesRow(
        bool HasUnendedMembership,
        IReadOnlyList<string> GroupNames,
        IReadOnlyList<string> RoleNames,
        IReadOnlyList<string> GroupAdminNames,
        IReadOnlyList<string> BoardOfficeNames,
        IReadOnlyList<string> VenueNames
    );
}
