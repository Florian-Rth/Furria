using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using System.Text;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Application.Intakes;
using Furria.Application.Results;
using Furria.Core.Intakes;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Intakes;

public sealed partial class IntakeService
{
    private const string UnknownIntakeMessage = "Diese QR-Anmeldung gibt es nicht.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string NoIntakeRightsMessage =
        "QR-Anmeldungen erstellt, wer Personen verwaltet oder eine Gruppe leitet.";
    private const string NotStarterMessage =
        "Diese QR-Anmeldung kann nur ändern, wer sie erstellt hat oder Personen verwaltet.";
    private const string DecisionBeyondRightsMessage =
        "Über eine Mitgliedschaft entscheidet der Verein; du wählst nur Gruppen, die du leitest.";
    private const string NoAffiliationMessage =
        "Eine QR-Anmeldung braucht eine Mitgliedschaft oder mindestens eine Gruppe.";
    private const string AlreadyFilledInMessage = "Diese QR-Anmeldung ist schon ausgefüllt.";
    private const string AlreadyCompletedMessage = "Diese QR-Anmeldung ist schon abgeschlossen.";
    private const string AlreadyDiscardedMessage = "Diese QR-Anmeldung ist verworfen.";
    private const string ChangedMeanwhileMessage =
        "Die QR-Anmeldung wurde gerade anderswo geändert. Bitte neu laden.";

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly AccountAccessService _accountAccessService;
    private readonly PersonService _personService;
    private readonly MediaPictures _pictures;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _timeProvider;
    private readonly byte[] _key;

    public IntakeService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        AccountAccessService accountAccessService,
        PersonService personService,
        MediaPictures pictures,
        IServiceScopeFactory scopeFactory,
        IOptions<AccessTokenOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _accountAccessService = accountAccessService;
        _personService = personService;
        _pictures = pictures;
        _scopeFactory = scopeFactory;
        _timeProvider = timeProvider;
        _key = Encoding.UTF8.GetBytes(options.Value.SigningKey);
    }

    public async Task<Result<IntakeLinkDetails>> StartAsync(
        StartIntakeCommand command,
        CancellationToken ct
    )
    {
        var actor = await ActorAsync(command.ActorAccountId, ct);
        if (!actor.MayRunIntakes)
            return Result<IntakeLinkDetails>.Forbidden(NoIntakeRightsMessage);

        var decision = IntakeDecision.Of(command.MemberFrom, command.GroupIds);
        var refusal = await RefusalOfAsync(actor.MayDecide(decision), decision, decision, ct);
        if (refusal is { } refused)
            return Result<IntakeLinkDetails>.Carrying(refused);

        var intake = new Intake
        {
            StartedByPersonId = actor.PersonId,
            MemberFrom = decision.MemberFrom,
            Label = LabelOf(command.Label),
            Groups =
            [
                .. decision.GroupIds.Select(groupId => new IntakeGroup { GroupId = groupId }),
            ],
        };
        IssueLink(intake);
        _dbContext.Intakes.Add(intake);
        await _dbContext.SaveChangesAsync(ct);

        return Result<IntakeLinkDetails>.Success(LinkOf(intake));
    }

    public async Task<Result<IReadOnlyList<IntakeSummary>>> GetIntakesAsync(
        int actorAccountId,
        CancellationToken ct
    )
    {
        var actor = await ActorAsync(actorAccountId, ct);
        if (!actor.MayRunIntakes)
            return Result<IReadOnlyList<IntakeSummary>>.Forbidden(NoIntakeRightsMessage);

        var rows = await VisibleTo(actor)
            .OrderByDescending(intake => intake.CreatedAt)
            .ThenByDescending(intake => intake.Id)
            .Select(Row())
            .ToListAsync(ct);
        var now = _timeProvider.GetUtcNow();

        return Result<IReadOnlyList<IntakeSummary>>.Success([
            .. rows.Select(row => SummaryOf(row, actor, now)),
        ]);
    }

    public async Task<Result<IntakeDetails>> GetIntakeAsync(
        int actorAccountId,
        int intakeId,
        CancellationToken ct
    )
    {
        var actor = await ActorAsync(actorAccountId, ct);
        if (!actor.MayRunIntakes)
            return Result<IntakeDetails>.Forbidden(NoIntakeRightsMessage);

        var row = await VisibleTo(actor)
            .Where(intake => intake.Id == intakeId)
            .Select(Row())
            .SingleOrDefaultAsync(ct);
        if (row is null)
            return Result<IntakeDetails>.NotFound(UnknownIntakeMessage);

        var summary = SummaryOf(row, actor, _timeProvider.GetUtcNow());
        return Result<IntakeDetails>.Success(
            new IntakeDetails
            {
                Intake = summary,
                Token =
                    summary.CanManage && summary.State == IntakeState.Open
                        ? await LinkTokenAsync(intakeId, ct)
                        : null,
                Review =
                    summary.CanManage && summary.State == IntakeState.NeedsReview
                        ? await ReviewOfAsync(intakeId, actor.ManagesPersons, ct)
                        : null,
            }
        );
    }

    public async Task<Result> EditAsync(EditIntakeCommand command, CancellationToken ct)
    {
        var access = await ManagedIntakeAsync(command.ActorAccountId, command.IntakeId, ct);
        if (!access.IsSuccess)
            return Result.Carrying(access);

        var (actor, intake) = access.Value;
        if (RefusalToRedecide(intake.StateAt(_timeProvider.GetUtcNow())) is { } message)
            return Result.Conflict(message);

        var current = IntakeDecision.Of(
            intake.MemberFrom,
            intake.Groups.Select(link => link.GroupId)
        );
        var changed = IntakeDecision.Of(command.MemberFrom, command.GroupIds);
        var refusal = await RefusalOfAsync(
            actor.MayRedecide(current, changed),
            changed,
            AddedGroupsOf(current, changed),
            ct
        );
        if (refusal is { } refused)
            return refused;

        intake.MemberFrom = changed.MemberFrom;
        intake.Label = LabelOf(command.Label);
        RegroupTo(intake, changed);

        return await SaveRaceFreeAsync(intake, ct);
    }

    public async Task<Result<IntakeLinkDetails>> RenewAsync(
        int actorAccountId,
        int intakeId,
        CancellationToken ct
    )
    {
        var access = await ManagedIntakeAsync(actorAccountId, intakeId, ct);
        if (!access.IsSuccess)
            return Result<IntakeLinkDetails>.Carrying(access);

        var intake = access.Value.Intake;
        if (RefusalToRedecide(intake.StateAt(_timeProvider.GetUtcNow())) is { } message)
            return Result<IntakeLinkDetails>.Conflict(message);

        IssueLink(intake);
        var saved = await SaveRaceFreeAsync(intake, ct);

        return saved.IsSuccess
            ? Result<IntakeLinkDetails>.Success(LinkOf(intake))
            : Result<IntakeLinkDetails>.Carrying(saved);
    }

    public async Task<Result> DiscardAsync(int actorAccountId, int intakeId, CancellationToken ct)
    {
        var access = await ManagedIntakeAsync(actorAccountId, intakeId, ct);
        if (!access.IsSuccess)
            return Result.Carrying(access);

        var intake = access.Value.Intake;
        var now = _timeProvider.GetUtcNow();
        var state = intake.StateAt(now);
        if (state == IntakeState.Completed)
            return Result.Conflict(AlreadyCompletedMessage);

        if (state == IntakeState.Discarded)
            return Result.Success();

        intake.DiscardedAt = now;
        intake.TokenSeed = null;
        ForgetNewcomer(intake);
        var saved = await SaveRaceFreeAsync(intake, ct);
        if (saved.IsSuccess)
            await DropPortraitsOfAsync(intake.Id, ct);

        return saved;
    }

    private async Task<Result> SaveRaceFreeAsync(Intake intake, CancellationToken ct)
    {
        intake.Version++;
        try
        {
            await _dbContext.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException exception) when (LostWriteRace.Caused(exception))
        {
            return Result.Conflict(ChangedMeanwhileMessage);
        }
    }

    private async Task<string?> LinkTokenAsync(int intakeId, CancellationToken ct) =>
        await _dbContext
            .Intakes.Where(intake => intake.Id == intakeId)
            .Select(intake => intake.TokenSeed)
            .SingleAsync(ct)
            is { } seed
            ? IntakeTokens.TokenOf(_key, seed)
            : null;

    private Task<IntakeActor> ActorAsync(int accountId, CancellationToken ct) =>
        _authorizer.IntakeActorAsync(accountId, ct);

    private async Task<Result<ManagedIntake>> ManagedIntakeAsync(
        int actorAccountId,
        int intakeId,
        CancellationToken ct
    )
    {
        var actor = await ActorAsync(actorAccountId, ct);
        if (!actor.MayRunIntakes)
            return Result<ManagedIntake>.Forbidden(NoIntakeRightsMessage);

        var intake = await VisibleTo(actor)
            .Include(row => row.Groups)
            .SingleOrDefaultAsync(row => row.Id == intakeId, ct);
        if (intake is null)
            return Result<ManagedIntake>.NotFound(UnknownIntakeMessage);

        return actor.Manages(intake.StartedByPersonId)
            ? Result<ManagedIntake>.Success(new ManagedIntake(actor, intake))
            : Result<ManagedIntake>.Forbidden(NotStarterMessage);
    }

    private async Task<Result?> RefusalOfAsync(
        bool mayDecide,
        IntakeDecision decision,
        IntakeDecision groupsToCheck,
        CancellationToken ct
    )
    {
        if (!decision.HasAffiliation)
            return Result.Validation(NoAffiliationMessage);

        if (!mayDecide)
            return Result.Forbidden(DecisionBeyondRightsMessage);

        return await AreLiveGroupsAsync(groupsToCheck.GroupIds, ct)
            ? null
            : Result.NotFound(UnknownGroupMessage);
    }

    private async Task<bool> AreLiveGroupsAsync(IReadOnlySet<int> groupIds, CancellationToken ct) =>
        groupIds.Count == 0
        || await _dbContext.Groups.CountAsync(
            group => groupIds.Contains(group.Id) && group.ArchivedOn == null,
            ct
        ) == groupIds.Count;

    private IQueryable<Intake> VisibleTo(IntakeActor actor)
    {
        if (actor.ManagesPersons)
            return _dbContext.Intakes;

        var personId = actor.PersonId;
        var administered = actor.AdministeredGroupIds.ToList();
        return _dbContext.Intakes.Where(intake =>
            (personId != null && intake.StartedByPersonId == personId)
            || intake.Groups.Any(link => administered.Contains(link.GroupId))
        );
    }

    private void IssueLink(Intake intake)
    {
        var seed = IntakeTokens.NewSeed();
        intake.TokenSeed = seed;
        intake.TokenHash = IntakeTokens.HashOf(_key, seed);
        intake.ExpiresAt = Intake.ExpiryFor(_timeProvider.GetUtcNow());
    }

    private IntakeLinkDetails LinkOf(Intake intake) =>
        new()
        {
            IntakeId = intake.Id,
            Token = IntakeTokens.TokenOf(_key, intake.TokenSeed!),
            ExpiresAt = intake.ExpiresAt,
        };

    private static void RegroupTo(Intake intake, IntakeDecision changed)
    {
        foreach (
            var dropped in intake
                .Groups.Where(link => !changed.GroupIds.Contains(link.GroupId))
                .ToList()
        )
            intake.Groups.Remove(dropped);

        var kept = intake.Groups.Select(link => link.GroupId).ToHashSet();
        foreach (var groupId in changed.GroupIds.Where(groupId => !kept.Contains(groupId)))
            intake.Groups.Add(new IntakeGroup { GroupId = groupId });
    }

    private static void ForgetNewcomer(Intake intake)
    {
        intake.FirstName = null;
        intake.LastName = null;
        intake.BirthDate = null;
        intake.Street = null;
        intake.Zip = null;
        intake.City = null;
        intake.Phone = null;
        intake.Email = null;
        intake.ClubGroupConsent = false;
    }

    [Pure]
    private static string? RefusalToRedecide(IntakeState state) =>
        state switch
        {
            IntakeState.Open or IntakeState.Expired => null,
            IntakeState.Discarded => AlreadyDiscardedMessage,
            IntakeState.Completed => AlreadyCompletedMessage,
            _ => AlreadyFilledInMessage,
        };

    [Pure]
    private static IntakeDecision AddedGroupsOf(IntakeDecision current, IntakeDecision changed) =>
        IntakeDecision.Of(null, changed.GroupIds.Except(current.GroupIds));

    [Pure]
    private static string? LabelOf(string? label) =>
        string.IsNullOrWhiteSpace(label) ? null : label.Trim();

    [Pure]
    private static IntakeSummary SummaryOf(IntakeRow row, IntakeActor actor, DateTimeOffset now) =>
        new()
        {
            IntakeId = row.IntakeId,
            State = Intake.StateOf(
                row.DiscardedAt,
                row.CompletedAt,
                row.SubmittedAt,
                row.ExpiresAt,
                now
            ),
            Label = row.Label,
            Newcomer = row.Person ?? row.Submitted,
            MemberFrom = row.MemberFrom,
            Groups = row.Groups,
            StartedBy = row.StartedBy,
            CanManage = actor.Manages(row.StartedBy?.PersonId),
            CreatedAt = row.CreatedAt,
            ExpiresAt = row.ExpiresAt,
            SubmittedAt = row.SubmittedAt,
            CompletedAt = row.CompletedAt,
            DiscardedAt = row.DiscardedAt,
        };

    [Pure]
    private static Expression<Func<Intake, IntakeRow>> Row() =>
        intake => new IntakeRow(
            intake.Id,
            intake.Label,
            intake.MemberFrom,
            intake.StartedBy == null
                ? null
                : new IntakePersonName(
                    intake.StartedBy.Id,
                    intake.StartedBy.FirstName,
                    intake.StartedBy.LastName
                ),
            intake.Person == null
                ? null
                : new IntakePersonName(
                    intake.Person.Id,
                    intake.Person.FirstName,
                    intake.Person.LastName
                ),
            intake.FirstName == null || intake.LastName == null
                ? null
                : new IntakePersonName(null, intake.FirstName, intake.LastName),
            intake
                .Groups.OrderBy(link => link.Group!.Name)
                .Select(link => new IntakeGroupName(link.GroupId, link.Group!.Name))
                .ToList(),
            intake.CreatedAt,
            intake.ExpiresAt,
            intake.SubmittedAt,
            intake.CompletedAt,
            intake.DiscardedAt
        );

    private sealed record ManagedIntake(IntakeActor Actor, Intake Intake);

    private sealed record IntakeRow(
        int IntakeId,
        string? Label,
        DateOnly? MemberFrom,
        IntakePersonName? StartedBy,
        IntakePersonName? Person,
        IntakePersonName? Submitted,
        IReadOnlyList<IntakeGroupName> Groups,
        DateTimeOffset CreatedAt,
        DateTimeOffset ExpiresAt,
        DateTimeOffset? SubmittedAt,
        DateTimeOffset? CompletedAt,
        DateTimeOffset? DiscardedAt
    );
}
