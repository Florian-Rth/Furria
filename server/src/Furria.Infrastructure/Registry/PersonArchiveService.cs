using System.Diagnostics.Contracts;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Roles;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Registry;

public sealed class PersonArchiveService
{
    public const string LastDayTooLateMessage = "Der letzte Tag ist spätestens gestern.";

    private const string UnknownPersonMessage = "Diese Person steht nicht im Register.";
    private const string MissingLastDayMessage = "Der letzte Tag fehlt – es läuft noch etwas.";
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
            ? await ArchiveAsync(person, command, ct)
            : await RestoreAsync(person, ct);
    }

    private async Task<Result> ArchiveAsync(
        Person person,
        PersonArchiveCommand command,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var ties = await UnendedTiesOfAsync(person.Id, today, ct);
        var begun = ties.Where(tie => HasBegunBefore(tie, today)).ToList();
        var ahead = ties.Where(tie => !HasBegunBefore(tie, today)).ToList();

        if (LastDayRefusalOf(begun, command.LastDay, today) is { } refusal)
            return Result.Validation(refusal);

        if (command.LastDay is { } lastDay)
            EndAll(begun, lastDay);

        DeleteAll(ahead);
        person.ArchivedOn = today;
        person.ArchivedByPersonId = command.ActorPersonId;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<Result> RestoreAsync(Person person, CancellationToken ct)
    {
        person.LiftArchive();
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private static void EndAll(IEnumerable<UnendedTie> ties, DateOnly lastDay)
    {
        foreach (var tie in ties)
        {
            tie.EndOn(lastDay);
        }
    }

    private static void DeleteAll(IEnumerable<UnendedTie> ties)
    {
        foreach (var tie in ties)
        {
            tie.Delete();
        }
    }

    private void EndMembership(Membership membership, DateOnly lastDay)
    {
        membership.EndedOn = lastDay;
        _dbContext.MembershipPauses.RemoveRange(
            MembershipPauseCut.LyingAfter(membership.Pauses, lastDay)
        );
        MembershipPauseCut.CutAt(membership.Pauses, lastDay);
    }

    private async Task<IReadOnlyList<UnendedTie>> UnendedTiesOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        [
            .. (await UnendedMembershipsOfAsync(personId, today, ct)).Select(
                membership => new UnendedTie(
                    MembershipLabel,
                    membership.StartedOn,
                    () => _dbContext.Remove(membership),
                    lastDay => EndMembership(membership, lastDay)
                )
            ),
            .. (await UnendedGroupMembershipsOfAsync(personId, today, ct)).Select(
                membership => new UnendedTie(
                    Labelled(GroupLabel, membership.Group!.Name),
                    membership.JoinedOn,
                    () => _dbContext.Remove(membership),
                    lastDay => membership.LeftOn = lastDay
                )
            ),
            .. (await UnendedRoleHoldingsOfAsync(personId, today, ct)).Select(
                holding => new UnendedTie(
                    Labelled(RoleLabel, holding.Role!.Name),
                    holding.SinceOn,
                    () => _dbContext.Remove(holding),
                    lastDay => holding.UntilOn = lastDay
                )
            ),
            .. (await UnendedGroupAdminsOfAsync(personId, today, ct)).Select(
                tenure => new UnendedTie(
                    Labelled(GroupAdminLabel, tenure.Group!.Name),
                    tenure.SinceOn,
                    () => _dbContext.Remove(tenure),
                    lastDay => tenure.UntilOn = lastDay
                )
            ),
            .. (await UnendedBoardSeatsOfAsync(personId, today, ct)).Select(seat => new UnendedTie(
                Labelled(BoardSeatLabel, seat.BoardOffice!.Name),
                seat.SinceOn,
                () => _dbContext.Remove(seat),
                lastDay => seat.UntilOn = lastDay
            )),
            .. (await UnendedKeyHoldingsOfAsync(personId, today, ct)).Select(
                holding => new UnendedTie(
                    Labelled(KeyHoldingLabel, holding.Venue!.Name),
                    holding.SinceOn,
                    () => _dbContext.Remove(holding),
                    lastDay => holding.UntilOn = lastDay
                )
            ),
        ];

    private Task<List<Membership>> UnendedMembershipsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .Memberships.Include(membership => membership.Pauses)
            .Where(membership => membership.PersonId == personId)
            .Where(RunningOrAhead.Memberships(today))
            .ToListAsync(ct);

    private Task<List<GroupMembership>> UnendedGroupMembershipsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .GroupMemberships.Include(membership => membership.Group)
            .Where(membership => membership.PersonId == personId)
            .Where(RunningOrAhead.GroupMemberships(today))
            .ToListAsync(ct);

    private Task<List<RoleHolding>> UnendedRoleHoldingsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .RoleHoldings.Include(holding => holding.Role)
            .Where(holding => holding.PersonId == personId)
            .Where(RunningOrAhead.RoleHoldings(today))
            .ToListAsync(ct);

    private Task<List<GroupAdmin>> UnendedGroupAdminsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .GroupAdmins.Include(tenure => tenure.Group)
            .Where(tenure => tenure.PersonId == personId)
            .Where(RunningOrAhead.GroupAdmins(today))
            .ToListAsync(ct);

    private Task<List<BoardSeat>> UnendedBoardSeatsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .BoardSeats.Include(seat => seat.BoardOffice)
            .Where(seat => seat.PersonId == personId)
            .Where(RunningOrAhead.BoardSeats(today))
            .ToListAsync(ct);

    private Task<List<KeyHolding>> UnendedKeyHoldingsOfAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        _dbContext
            .KeyHoldings.Include(holding => holding.Venue)
            .Where(holding => holding.PersonId == personId)
            .Where(RunningOrAhead.KeyHoldings(today))
            .ToListAsync(ct);

    [Pure]
    private static bool IsArchived(Person person) => person.ArchivedOn is not null;

    [Pure]
    private static bool HasBegunBefore(UnendedTie tie, DateOnly today) => tie.StartsOn < today;

    [Pure]
    private static string? LastDayRefusalOf(
        IReadOnlyList<UnendedTie> begun,
        DateOnly? lastDay,
        DateOnly today
    )
    {
        if (begun.Count == 0)
            return null;

        if (lastDay is null)
            return MissingLastDayMessage;

        if (lastDay >= today)
            return LastDayTooLateMessage;

        var latest = begun.MaxBy(tie => tie.StartsOn)!;

        return lastDay < latest.StartsOn ? BeforeStartMessage(latest) : null;
    }

    [Pure]
    private static string BeforeStartMessage(UnendedTie tie) =>
        $"Der letzte Tag liegt vor dem Beginn von {tie.Label}.";

    [Pure]
    private static string Labelled(string label, string name) => $"{label} {name}";

    private sealed record UnendedTie(
        string Label,
        DateOnly StartsOn,
        Action Delete,
        Action<DateOnly> EndOn
    );
}
