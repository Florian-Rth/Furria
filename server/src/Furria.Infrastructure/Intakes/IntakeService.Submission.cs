using System.Diagnostics.Contracts;
using Furria.Application.Intakes;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Intakes;
using Furria.Core.Push;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Push;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Infrastructure.Intakes;

public sealed partial class IntakeService
{
    private const string UnknownLinkMessage = "Diesen Link gibt es nicht.";
    private const string ExpiredLinkMessage =
        "Dieser Link ist abgelaufen. Bitte frag nach einem neuen.";
    private const string UsedLinkMessage = "Über diesen Link hast du dich schon eingetragen.";
    private const string DiscardedLinkMessage = "Dieser Link gilt nicht mehr.";
    private const string AddressRequiredMessage =
        "Als Mitglied gibst du bitte deine Anschrift an: Straße, PLZ und Ort.";
    private const string FutureBirthDateMessage = "Dein Geburtsdatum liegt in der Zukunft.";
    private const string NoAffiliationLeftMessage =
        "Dieser Link passt nicht mehr. Bitte sag Bescheid, wer ihn dir gegeben hat.";
    private const string LinkChangedMeanwhileMessage =
        "Dieser Link hat sich gerade geändert. Bitte lade die Seite neu.";

    public async Task<IntakeLinkLookup?> LookUpLinkAsync(string token, CancellationToken ct)
    {
        if (IntakeTokens.HashOfPresented(token) is not { } tokenHash)
            return null;

        var link = await _dbContext
            .Intakes.AsNoTracking()
            .Where(intake => intake.TokenHash == tokenHash)
            .Select(intake => new
            {
                intake.DiscardedAt,
                intake.CompletedAt,
                intake.SubmittedAt,
                intake.ExpiresAt,
                intake.MemberFrom,
            })
            .SingleOrDefaultAsync(ct);
        if (link is null)
            return null;

        var state = Intake.StateOf(
            link.DiscardedAt,
            link.CompletedAt,
            link.SubmittedAt,
            link.ExpiresAt,
            _timeProvider.GetUtcNow()
        );

        return new IntakeLinkLookup
        {
            ClubName = await ClubNameAsync(ct),
            State = Intake.LinkStateOf(state),
            AddressRequired = link.MemberFrom is not null,
        };
    }

    public async Task<Result<IntakeSubmission>> SubmitAsync(
        SubmitIntakeCommand command,
        CancellationToken ct
    )
    {
        var intake = await PresentedIntakeAsync(command.Token, ct);
        if (intake is null)
            return Result<IntakeSubmission>.NotFound(UnknownLinkMessage);

        if (RefusalToSubmit(intake.StateAt(_timeProvider.GetUtcNow())) is { } refusal)
            return Result<IntakeSubmission>.Conflict(refusal);

        var newcomer = Newcomer.Of(command);
        if (intake.RequiresAddress && !newcomer.HasAddress)
            return Result<IntakeSubmission>.Validation(AddressRequiredMessage);

        if (newcomer.BirthDate > ClubClock.Today(_timeProvider))
            return Result<IntakeSubmission>.Validation(FutureBirthDateMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockRegistryEntryAsync(ct);
        var submission = await MatchesSomeoneAsync(newcomer, ct)
            ? await ParkForReviewAsync(intake, newcomer, ct)
            : await EnterAsync(intake, newcomer, ct);
        if (submission.IsSuccess)
            await transaction.CommitAsync(ct);

        return submission;
    }

    private async Task<Result<IntakeSubmission>> ParkForReviewAsync(
        Intake intake,
        Newcomer newcomer,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        Hold(intake, newcomer);
        intake.SubmittedAt = now;
        intake.TokenSeed = null;
        await StagePushToStarterAsync(
            intake,
            PushOf(intake, newcomer, IntakePushKind.NeedsReview),
            ct
        );

        var saved = await SaveSubmissionAsync(intake, ct);

        return saved.IsSuccess
            ? Result<IntakeSubmission>.Success(IntakeSubmission.Received)
            : Result<IntakeSubmission>.Carrying(saved);
    }

    private async Task<Result<IntakeSubmission>> EnterAsync(
        Intake intake,
        Newcomer newcomer,
        CancellationToken ct
    )
    {
        var liveGroupIds = await LiveGroupIdsOfAsync(intake, ct);
        if (intake.MemberFrom is null && liveGroupIds.Count == 0)
            return Result<IntakeSubmission>.Conflict(NoAffiliationLeftMessage);

        var now = _timeProvider.GetUtcNow();
        var person = newcomer.ToPerson();
        _dbContext.People.Add(person);
        AffiliateWithDecision(person, intake, liveGroupIds, ClubClock.DayOf(now));
        intake.SubmittedAt = now;
        intake.CompletedAt = now;
        intake.Person = person;
        intake.TokenSeed = null;
        await StagePushToStarterAsync(
            intake,
            PushOf(intake, newcomer, IntakePushKind.Completed),
            ct
        );

        var saved = await SaveSubmissionAsync(intake, ct);
        if (!saved.IsSuccess)
            return Result<IntakeSubmission>.Carrying(saved);

        return await SettleNewPersonAsync(intake, person, newcomer, now, ct);
    }

    private async Task<Result<IntakeSubmission>> SettleNewPersonAsync(
        Intake intake,
        Person person,
        Newcomer newcomer,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        await HandPortraitToAsync(intake.Id, person, ct);
        await StampContactAsHerOwnAsync(person, newcomer, now, ct);
        var invitationLink = await _accountAccessService.InviteIntakeNewcomerAsync(
            person.Id,
            intake.StartedByPersonId,
            ct
        );

        return invitationLink.IsSuccess
            ? Result<IntakeSubmission>.Success(
                new IntakeSubmission { InvitationLink = invitationLink.Value }
            )
            : Result<IntakeSubmission>.Carrying(invitationLink);
    }

    private void AffiliateWithDecision(
        Person person,
        Intake intake,
        IReadOnlyList<int> liveGroupIds,
        DateOnly today
    )
    {
        if (intake.MemberFrom is { } memberFrom)
            _dbContext.Memberships.Add(
                new Membership
                {
                    Person = person,
                    StartedOn = memberFrom,
                    Intake = intake,
                }
            );

        _dbContext.GroupMemberships.AddRange(
            liveGroupIds.Select(groupId => new GroupMembership
            {
                Person = person,
                GroupId = groupId,
                JoinedOn = today,
            })
        );
    }

    private async Task StampContactAsHerOwnAsync(
        Person person,
        Newcomer newcomer,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (!newcomer.HasContactDetails)
            return;

        person.ContactChangedAt = now;
        person.ContactChangedByPersonId = person.Id;
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<Result> SaveSubmissionAsync(Intake intake, CancellationToken ct)
    {
        intake.Version++;
        try
        {
            await _dbContext.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException exception) when (LostWriteRace.Caused(exception))
        {
            return Result.Conflict(LinkChangedMeanwhileMessage);
        }
    }

    private async Task StagePushToStarterAsync(Intake intake, IntakePush push, CancellationToken ct)
    {
        if (intake.StartedByPersonId is not { } starterPersonId)
            return;

        var now = _timeProvider.GetUtcNow();
        var accountIds = await _dbContext
            .Users.AsNoTracking()
            .Where(account => account.PersonId == starterPersonId && !account.IsDisabled)
            .ListeningTo(_dbContext, PushTopic.Intakes)
            .Select(account => account.Id)
            .ToListAsync(ct);

        foreach (var accountId in accountIds)
            if (await RunsIntakesAsync(accountId, ct))
                _dbContext.OutboxPushes.Add(IntakePushMessages.For(push, accountId, now));
    }

    private async Task<bool> RunsIntakesAsync(int accountId, CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        return (
            await scope
                .ServiceProvider.GetRequiredService<PermissionAuthorizer>()
                .IntakeActorAsync(accountId, ct)
        ).MayRunIntakes;
    }

    private Task<bool> MatchesSomeoneAsync(Newcomer newcomer, CancellationToken ct) =>
        _dbContext
            .PeopleMatching(
                newcomer.Email,
                newcomer.FirstName,
                newcomer.LastName,
                newcomer.BirthDate
            )
            .AnyAsync(ct);

    private async Task<IReadOnlyList<int>> LiveGroupIdsOfAsync(Intake intake, CancellationToken ct)
    {
        var groupIds = intake.Groups.Select(link => link.GroupId).ToList();

        return await _dbContext
            .Groups.Where(group => groupIds.Contains(group.Id) && group.ArchivedOn == null)
            .Select(group => group.Id)
            .ToListAsync(ct);
    }

    private async Task<Intake?> PresentedIntakeAsync(string token, CancellationToken ct) =>
        IntakeTokens.HashOfPresented(token) is { } tokenHash
            ? await _dbContext
                .Intakes.Include(intake => intake.Groups)
                .SingleOrDefaultAsync(intake => intake.TokenHash == tokenHash, ct)
            : null;

    private Task<string?> ClubNameAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(record => record.Id == ClubRecord.TheOnlyId)
            .Select(record => record.Name)
            .SingleOrDefaultAsync(ct);

    private static void Hold(Intake intake, Newcomer newcomer)
    {
        intake.FirstName = newcomer.FirstName;
        intake.LastName = newcomer.LastName;
        intake.BirthDate = newcomer.BirthDate;
        intake.Street = newcomer.Street;
        intake.Zip = newcomer.Zip;
        intake.City = newcomer.City;
        intake.Phone = newcomer.Phone;
        intake.Email = newcomer.Email;
    }

    [Pure]
    private static IntakePush PushOf(Intake intake, Newcomer newcomer, IntakePushKind kind) =>
        new(intake.Id, newcomer.FullName, kind);

    [Pure]
    private static string? RefusalToSubmit(IntakeState state) =>
        state switch
        {
            IntakeState.Open => null,
            IntakeState.Expired => ExpiredLinkMessage,
            IntakeState.Discarded => DiscardedLinkMessage,
            _ => UsedLinkMessage,
        };

    private sealed record Newcomer(
        string FirstName,
        string LastName,
        DateOnly BirthDate,
        string? Street,
        string? Zip,
        string? City,
        string? Phone,
        string? Email
    )
    {
        public string FullName => $"{FirstName} {LastName}";

        public bool HasAddress => Street is not null && Zip is not null && City is not null;

        public bool HasContactDetails => (Street ?? Zip ?? City ?? Phone ?? Email) is not null;

        [Pure]
        public static Newcomer Of(SubmitIntakeCommand command) =>
            new(
                command.FirstName.Trim(),
                command.LastName.Trim(),
                command.BirthDate,
                Given(command.Street),
                Given(command.Zip),
                Given(command.City),
                Given(command.Phone),
                Given(command.Email)
            );

        [Pure]
        public static Newcomer HeldBy(Intake intake) =>
            new(
                intake.FirstName!,
                intake.LastName!,
                intake.BirthDate!.Value,
                intake.Street,
                intake.Zip,
                intake.City,
                intake.Phone,
                intake.Email
            );

        [Pure]
        public Person ToPerson() =>
            new()
            {
                FirstName = FirstName,
                LastName = LastName,
                BirthDate = BirthDate,
                Street = Street,
                Zip = Zip,
                City = City,
                Phone = Phone,
                Email = Email,
            };

        [Pure]
        private static string? Given(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
