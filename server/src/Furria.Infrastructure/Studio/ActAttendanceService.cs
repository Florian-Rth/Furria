using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Furria.Infrastructure.Studio;

public sealed class ActAttendanceService
{
    private const string NotGroupAdminMessage =
        "Anwesenheit trägt nur die Leitung der Gruppe des Auftritts ein.";
    private const string NoTrainingMessage =
        "Dieses Training steht für den Auftritt nicht mehr an.";
    private const string NotInCastMessage = "Diese Person ist nicht in der Besetzung.";
    private const string NothingMarkedMessage = "Für diese Person ist nichts eingetragen.";
    private const string AnsweredHerselfMessage =
        "Sie hat inzwischen selbst geantwortet – ihre Antwort bleibt.";
    private const string MarkedMeanwhileMessage =
        "Gerade wurde für diese Person schon etwas eingetragen. Lade neu.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTrainingReader _trainings;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ActAttendanceService(
        AppDbContext dbContext,
        ActStudioGate gate,
        ActTrainingReader trainings,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _trainings = trainings;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<Result> MarkAsync(
        int accountId,
        MarkAttendanceCommand command,
        CancellationToken ct
    )
    {
        var target = command.Target;
        if (await RefusalAsync(accountId, target, ct) is { } refusal)
            return refusal;

        var recorder = await _authorizer.ActivePersonIdAsync(accountId, ct);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        _dbContext.Record(
            await _dbContext.LockedResponseAsync(target.CalendarEntryId, target.PersonId, ct),
            new AttendanceRecord(
                target.CalendarEntryId,
                target.PersonId,
                command.Answer,
                IsRecordedOnBehalf: true,
                RecordedByPersonId: recorder
            ),
            _timeProvider.GetUtcNow()
        );

        return await CommittedAsync(transaction, ct);
    }

    public async Task<Result> WithdrawAsync(
        int accountId,
        ActTrainingPersonCommand target,
        CancellationToken ct
    )
    {
        if (await RefusalAsync(accountId, target, ct) is { } refusal)
            return refusal;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var recorded = await _dbContext.LockedResponseAsync(
            target.CalendarEntryId,
            target.PersonId,
            ct
        );
        if (recorded is null)
            return Result.NotFound(NothingMarkedMessage);
        if (!recorded.IsRecordedOnBehalf)
            return Result.Conflict(AnsweredHerselfMessage);

        var trail = await _dbContext
            .AttendanceResponseChanges.Where(change =>
                change.CalendarEntryId == target.CalendarEntryId
                && change.PersonId == target.PersonId
            )
            .OrderByDescending(change => change.Id)
            .Take(2)
            .ToListAsync(ct);

        if (trail.FirstOrDefault() is { } mark)
            _dbContext.AttendanceResponseChanges.Remove(mark);

        if (trail.Skip(1).FirstOrDefault() is { } previous)
            RestoreTo(recorded, previous);
        else
            _dbContext.AttendanceResponses.Remove(recorded);

        return await CommittedAsync(transaction, ct);
    }

    private static void RestoreTo(AttendanceResponse recorded, AttendanceResponseChange previous)
    {
        recorded.Answer = previous.Answer;
        recorded.IsRecordedOnBehalf = previous.IsRecordedOnBehalf;
        recorded.RecordedByPersonId = previous.RecordedByPersonId;
    }

    private async Task<Result?> RefusalAsync(
        int accountId,
        ActTrainingPersonCommand target,
        CancellationToken ct
    )
    {
        var act = await _gate.ActAsync(target.ActId, ct);
        if (act is null)
            return Result.NotFound(ActStudioGate.UnknownActMessage);
        if (!await _gate.LeadsGroupAsync(accountId, act, ct))
            return Result.Forbidden(NotGroupAdminMessage);
        if (ActStudioGate.ReadOnlyRefusalOf(act) is { } readOnly)
            return readOnly;

        return await TargetRefusalAsync(act, target, ct);
    }

    private async Task<Result?> TargetRefusalAsync(
        ActSummary act,
        ActTrainingPersonCommand target,
        CancellationToken ct
    )
    {
        if (!await _trainings.IsComingTrainingOfAsync(act, target.CalendarEntryId, ct))
            return Result.NotFound(NoTrainingMessage);

        return act.Cast.Any(member => member.PersonId == target.PersonId)
            ? null
            : Result.NotFound(NotInCastMessage);
    }

    private async Task<Result> CommittedAsync(
        IDbContextTransaction transaction,
        CancellationToken ct
    )
    {
        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result.Conflict(MarkedMeanwhileMessage);

        await transaction.CommitAsync(ct);

        return Result.Success();
    }
}
