using System.Diagnostics.Contracts;
using Furria.Application.Intakes;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Intakes;
using Furria.Core.Media;
using Furria.Core.Ties;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Intakes;

public sealed partial class IntakeService
{
    private const string NotAwaitingReviewMessage = "Diese QR-Anmeldung wartet auf keine Prüfung.";
    private const string NothingLeftToJoinMessage =
        "Alle Gruppen dieser QR-Anmeldung sind inzwischen archiviert, und eine Mitgliedschaft ist nicht vorgesehen. Wähle eine passende Person oder verwirf die QR-Anmeldung.";
    private const string NotACandidateMessage =
        "Diese Person passt nicht zur QR-Anmeldung – sie teilt weder die E-Mail-Adresse noch Name und Geburtsdatum.";

    public async Task<Result<int>> ResolveAsync(ResolveIntakeCommand command, CancellationToken ct)
    {
        var access = await ManagedIntakeAsync(command.ActorAccountId, command.IntakeId, ct);
        if (!access.IsSuccess)
            return Result<int>.Carrying(access);

        var (actor, intake) = access.Value;
        if (intake.StateAt(_timeProvider.GetUtcNow()) != IntakeState.NeedsReview)
            return Result<int>.Conflict(NotAwaitingReviewMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockRegistryEntryAsync(ct);
        var newcomer = Newcomer.HeldBy(intake);
        if (actor.PersonId != intake.StartedByPersonId)
            await StagePushToStarterAsync(
                intake,
                PushOf(intake, newcomer, IntakePushKind.Completed),
                ct
            );

        var resolved = command.PersonId is { } personId
            ? await RecogniseAsync(intake, newcomer, personId, ct)
            : await EnterHeldAsync(intake, newcomer, ct);
        if (resolved.IsSuccess)
            await transaction.CommitAsync(ct);

        return resolved;
    }

    private async Task<Result<int>> EnterHeldAsync(
        Intake intake,
        Newcomer newcomer,
        CancellationToken ct
    )
    {
        var liveGroupIds = await LiveGroupIdsOfAsync(intake, ct);
        if (intake.MemberFrom is null && liveGroupIds.Count == 0)
            return Result<int>.Conflict(NothingLeftToJoinMessage);

        var now = _timeProvider.GetUtcNow();
        var person = newcomer.ToPerson();
        _dbContext.People.Add(person);
        AffiliateWithDecision(person, intake, liveGroupIds, ClubClock.DayOf(now));
        CompleteAs(intake, person, now);

        var saved = await SaveRaceFreeAsync(intake, ct);
        if (!saved.IsSuccess)
            return Result<int>.Carrying(saved);

        var settled = await SettleNewPersonAsync(intake, person, newcomer, now, ct);
        return settled.IsSuccess ? Result<int>.Success(person.Id) : Result<int>.Carrying(settled);
    }

    private async Task<Result<int>> RecogniseAsync(
        Intake intake,
        Newcomer newcomer,
        int personId,
        CancellationToken ct
    )
    {
        if (!await MatchingPeople(newcomer).AnyAsync(person => person.Id == personId, ct))
            return Result<int>.Conflict(NotACandidateMessage);

        var filled = await _personService.FillGapsAsync(ToGapFill(personId, newcomer), ct);
        if (!filled.IsSuccess)
            return Result<int>.Carrying(filled);

        var person = await _dbContext.People.SingleAsync(row => row.Id == personId, ct);
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.DayOf(now);
        await OpenMissingMembershipAsync(person, intake, today, ct);
        await JoinMissingGroupsAsync(person, intake, today, ct);
        CompleteAs(intake, person, now);

        var saved = await SaveRaceFreeAsync(intake, ct);
        if (!saved.IsSuccess)
            return Result<int>.Carrying(saved);

        await HandPortraitToAsync(intake.Id, person, ct);
        var invitation = await _accountAccessService.InviteIntakeNewcomerAsync(
            personId,
            intake.StartedByPersonId,
            ct
        );

        return invitation.IsSuccess
            ? Result<int>.Success(personId)
            : Result<int>.Carrying(invitation);
    }

    private async Task OpenMissingMembershipAsync(
        Person person,
        Intake intake,
        DateOnly today,
        CancellationToken ct
    )
    {
        if (intake.MemberFrom is not { } memberFrom)
            return;

        var endings = await _dbContext
            .Memberships.Where(membership => membership.PersonId == person.Id)
            .Select(membership => membership.EndedOn)
            .ToListAsync(ct);
        if (endings.Any(endedOn => endedOn is null || endedOn >= today))
            return;

        person.LiftArchive();
        _dbContext.Memberships.Add(
            new Membership
            {
                PersonId = person.Id,
                StartedOn = Intake.RejoinOn(memberFrom, endings.Max()),
                Intake = intake,
            }
        );
    }

    private async Task JoinMissingGroupsAsync(
        Person person,
        Intake intake,
        DateOnly today,
        CancellationToken ct
    )
    {
        var joinedGroupIds = await _dbContext
            .GroupMemberships.Where(membership =>
                membership.PersonId == person.Id
                && (membership.LeftOn == null || membership.LeftOn >= today)
            )
            .Select(membership => membership.GroupId)
            .ToListAsync(ct);
        var missing = (await LiveGroupIdsOfAsync(intake, ct)).Except(joinedGroupIds).ToList();
        if (missing.Count == 0)
            return;

        person.LiftArchive();
        _dbContext.GroupMemberships.AddRange(
            missing.Select(groupId => new GroupMembership
            {
                PersonId = person.Id,
                GroupId = groupId,
                JoinedOn = today,
            })
        );
    }

    private async Task<IntakeReviewDetails> ReviewOfAsync(
        int intakeId,
        bool seesRegister,
        CancellationToken ct
    )
    {
        var intake = await _dbContext
            .Intakes.AsNoTracking()
            .SingleAsync(row => row.Id == intakeId, ct);
        var newcomer = Newcomer.HeldBy(intake);

        return new IntakeReviewDetails
        {
            Newcomer = await NewcomerDetailsOfAsync(intake, newcomer, ct),
            Candidates = await CandidatesOfAsync(newcomer, seesRegister, ct),
        };
    }

    private async Task<IntakeNewcomerDetails> NewcomerDetailsOfAsync(
        Intake intake,
        Newcomer newcomer,
        CancellationToken ct
    )
    {
        var portrait = await _dbContext
            .MediaItems.AsNoTracking()
            .Where(item =>
                item.OwnerKind == MediaOwnerKind.Intake && item.OwnerIntakeId == intake.Id
            )
            .OrderByDescending(item => item.Id)
            .Select(item => new { item.Id, item.RenderedAt })
            .FirstOrDefaultAsync(ct);

        return new IntakeNewcomerDetails
        {
            FirstName = newcomer.FirstName,
            LastName = newcomer.LastName,
            BirthDate = newcomer.BirthDate,
            Street = newcomer.Street,
            Zip = newcomer.Zip,
            City = newcomer.City,
            Phone = newcomer.Phone,
            Email = newcomer.Email,
            Portrait = _pictures.Of(
                MediaOwner.Intake(intake.Id),
                portrait?.Id,
                portrait?.RenderedAt
            ),
        };
    }

    private async Task<IReadOnlyList<IntakeCandidate>> CandidatesOfAsync(
        Newcomer newcomer,
        bool seesRegister,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var rows = await MatchingPeople(newcomer)
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new CandidateRow(
                person.Id,
                person.FirstName,
                person.LastName,
                person.BirthDate,
                person.Email,
                person.Memberships.Any(membership =>
                    membership.EndedOn == null || membership.EndedOn >= today
                ),
                person
                    .GroupMemberships.AsQueryable()
                    .Where(Conferring.GroupMemberships(today))
                    .OrderBy(membership =>
                        EF.Functions.Collate(membership.Group!.Name, GermanCollation.Name)
                    )
                    .Select(membership => membership.Group!.Name)
                    .ToList(),
                _dbContext.Users.Any(account => account.PersonId == person.Id),
                person.PortraitId,
                person.Portrait == null ? null : person.Portrait.RenderedAt
            ))
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => CandidateOf(row, newcomer))
                .Select(candidate => seesRegister ? candidate : RecognisableOnly(candidate)),
        ];
    }

    private IntakeCandidate CandidateOf(CandidateRow row, Newcomer newcomer) =>
        new()
        {
            PersonId = row.PersonId,
            FirstName = row.FirstName,
            LastName = row.LastName,
            BirthDate = row.BirthDate,
            Match = MatchOf(row.Email, newcomer.Email),
            IsMember = row.IsMember,
            Groups = row.Groups,
            HasAccount = row.HasAccount,
            Portrait = _pictures.PortraitOf(row.PersonId, row.PortraitId, row.PortraitRenderedAt),
        };

    [Pure]
    private static IntakeCandidate RecognisableOnly(IntakeCandidate candidate) =>
        candidate with
        {
            BirthDate =
                candidate.Match == IntakeMatch.NameAndBirthDate ? candidate.BirthDate : null,
            IsMember = null,
            Groups = null,
            HasAccount = null,
        };

    private IQueryable<Person> MatchingPeople(Newcomer newcomer) =>
        _dbContext.PeopleMatching(
            newcomer.Email,
            newcomer.FirstName,
            newcomer.LastName,
            newcomer.BirthDate
        );

    private static void CompleteAs(Intake intake, Person person, DateTimeOffset now)
    {
        intake.CompletedAt = now;
        intake.Person = person;
        intake.TokenSeed = null;
        ForgetNewcomer(intake);
    }

    [Pure]
    private static IntakeMatch MatchOf(string? recordedEmail, string? givenEmail) =>
        recordedEmail is not null
        && givenEmail is not null
        && string.Equals(recordedEmail.Trim(), givenEmail, StringComparison.OrdinalIgnoreCase)
            ? IntakeMatch.Email
            : IntakeMatch.NameAndBirthDate;

    [Pure]
    private static FillPersonGapsCommand ToGapFill(int personId, Newcomer newcomer) =>
        new()
        {
            PersonId = personId,
            BirthDate = newcomer.BirthDate,
            Email = newcomer.Email,
            Phone = newcomer.Phone,
            Street = newcomer.Street,
            Zip = newcomer.Zip,
            City = newcomer.City,
            ActorPersonId = personId,
        };

    private sealed record CandidateRow(
        int PersonId,
        string FirstName,
        string LastName,
        DateOnly? BirthDate,
        string? Email,
        bool IsMember,
        IReadOnlyList<string> Groups,
        bool HasAccount,
        int? PortraitId,
        DateTimeOffset? PortraitRenderedAt
    );
}
