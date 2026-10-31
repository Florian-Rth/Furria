using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActEveningService
{
    private const string UnknownEveningMessage = "Diese Veranstaltung gibt es nicht.";
    private const string PastEveningMessage = "Dieser Abend ist vorbei, er bleibt so, wie er war.";
    private const string UnknownPersonMessage = "Diese Person gibt es nicht.";
    private const string UnknownSpotMessage = "Diesen Platz gibt es im Auftritt nicht.";
    private const string NotDancingThatEveningMessage =
        "Einen Platz bekommt an diesem Abend nur, wer an diesem Abend mittanzt.";
    private const string StaleCopyMessage =
        "Die Aufstellung für diesen Abend wurde inzwischen woanders geändert. Lade sie neu und ändere sie erneut.";
    private const string StaleSessionMessage =
        "Die Aufstellung der Session hat sich inzwischen geändert. Lade sie neu und passe den Abend erneut an.";
    private const string NoOwnChoreographyMessage = "Dieser Abend hat keine eigene Aufstellung.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly RunningOrderService _runningOrders;
    private readonly ActChoreographyService _choreographies;
    private readonly ChoreographyHistory _history;
    private readonly TimeProvider _timeProvider;

    public ActEveningService(
        AppDbContext dbContext,
        ActStudioGate gate,
        RunningOrderService runningOrders,
        ActChoreographyService choreographies,
        ChoreographyHistory history,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _runningOrders = runningOrders;
        _choreographies = choreographies;
        _history = history;
        _timeProvider = timeProvider;
    }

    public async Task<Result> JoinAsync(
        int accountId,
        ActEveningCommand evening,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, evening, ct);
        if (!act.IsSuccess)
            return Result.Carrying(act);

        var appearanceId = await AppearanceIdForAsync(evening, act.Value, ct);

        return appearanceId.IsSuccess ? Result.Success() : Result.Carrying(appearanceId);
    }

    public async Task<Result> LeaveAsync(
        int accountId,
        ActEveningCommand evening,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, evening, ct);
        if (!act.IsSuccess)
            return Result.Carrying(act);

        return await _runningOrders.RemoveUnplacedAppearanceAsync(
            evening.EventId,
            evening.ActId,
            ct
        );
    }

    public async Task<Result> SetCastAsync(
        int accountId,
        EveningCastCommand command,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, command.Evening, ct);
        if (!act.IsSuccess)
            return Result.Carrying(act);
        if (!await _dbContext.People.AnyAsync(person => person.Id == command.PersonId, ct))
            return Result.NotFound(UnknownPersonMessage);

        var inSessionCast = act.Value.Cast.Any(member => member.PersonId == command.PersonId);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var appearanceId = await AppearanceIdForAsync(command.Evening, act.Value, ct);
        if (!appearanceId.IsSuccess)
            return Result.Carrying(appearanceId);

        await ReplaceCastChangeAsync(
            appearanceId.Value,
            command.PersonId,
            EveningCasting.ChangeFor(inSessionCast, command.Dances),
            ct
        );
        await _runningOrders.MarkEveningChangedAsync(command.Evening.EventId, ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result> AssignSpotAsync(
        int accountId,
        EveningSpotCommand command,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, command.Evening, ct);
        if (!act.IsSuccess)
            return Result.Carrying(act);

        var session = await SessionSpotsOfAsync(act.Value.ActId, ct);
        if (session.All(spot => spot.SpotId != command.SpotId))
            return Result.NotFound(UnknownSpotMessage);
        if (
            command.PersonId is { } personId
            && !await DancesThatEveningAsync(act.Value, command.Evening.EventId, personId, ct)
        )
            return Result.Conflict(NotDancingThatEveningMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var appearanceId = await AppearanceIdForAsync(command.Evening, act.Value, ct);
        if (!appearanceId.IsSuccess)
            return Result.Carrying(appearanceId);

        await ReplaceSpotChangesAsync(
            appearanceId.Value,
            session,
            new SpotAssignment(command.SpotId, command.PersonId),
            ct
        );
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result<ChoreographySaveDetails>> SaveChoreographyAsync(
        int accountId,
        SaveEveningChoreographyCommand command,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, command.Evening, ct);
        if (!act.IsSuccess)
            return Result<ChoreographySaveDetails>.Carrying(act);

        return await _choreographies.RemergedOnLostRaceAsync(() =>
            MergeAndSaveCopyAsync(accountId, command, act.Value, ct)
        );
    }

    private async Task<Result<ChoreographySaveDetails>> MergeAndSaveCopyAsync(
        int accountId,
        SaveEveningChoreographyCommand command,
        ActSummary act,
        CancellationToken ct
    )
    {
        var copy = await CopyOfAsync(command.Evening, ct);
        var session = await SessionChoreographyAsync(command.Evening.ActId, ct);
        var baseline = await CopyBaselineAsync(copy, session, command, ct);
        if (!baseline.IsSuccess)
            return Result<ChoreographySaveDetails>.Carrying(baseline);

        var merge = await _choreographies.MergeAsync(
            new ChoreographyMergeQuery
            {
                ActId = command.Evening.ActId,
                Baseline = baseline.Value,
                Current = copy?.Document ?? session?.Document ?? ChoreographyDocument.Empty,
                ChangedTracks = command.ChangedTracks,
            },
            ct
        );
        if (!merge.IsSuccess || !merge.Value.IsClean)
            return ActChoreographyService.OverlapsOrRefusal(merge);
        if (copy is not null && merge.Value.Document.Matches(copy.Document))
            return ActChoreographyService.Saved(copy.Version);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var appearanceId = await AppearanceIdForAsync(command.Evening, act, ct);
        if (!appearanceId.IsSuccess)
            return Result<ChoreographySaveDetails>.Carrying(appearanceId);

        var saved = copy ?? AddedCopy(command.Evening.ActId, appearanceId.Value, session?.Version);
        await _history.WriteAsync(
            saved,
            ActChoreographyService.SavedBy(accountId, merge.Value.Document),
            ct
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return ActChoreographyService.Saved(saved.Version);
    }

    public async Task<Result<int>> RestoreChoreographyAsync(
        int accountId,
        RestoreEveningChoreographyCommand command,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, command.Evening, ct);
        if (!act.IsSuccess)
            return Result<int>.Carrying(act);

        var copy = await CopyOfAsync(command.Evening, ct);
        if (copy is null)
            return Result<int>.NotFound(NoOwnChoreographyMessage);

        var restored = await _choreographies.RestoredDocumentAsync(copy, command.Version, ct);
        if (!restored.IsSuccess)
            return Result<int>.Carrying(restored);

        await _history.WriteAsync(
            copy,
            new ChoreographyWrite
            {
                AccountId = accountId,
                Document = restored.Value,
                Kind = ChoreographyVersionKind.Restored,
                RestoredFromVersion = command.Version,
            },
            ct
        );
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(copy.Version);
    }

    public async Task<Result<ChoreographyVersionPage>> ChoreographyVersionsAsync(
        int accountId,
        ActEveningChoreographyVersionsQuery query,
        CancellationToken ct
    )
    {
        var act = await _gate.EditorsActAsync(accountId, query.ActId, ct);
        if (!act.IsSuccess)
            return Result<ChoreographyVersionPage>.Carrying(act);

        var copyId = await _dbContext
            .Choreographies.Where(row =>
                row.ActId == query.ActId && row.Appearance!.CalendarEntryId == query.EventId
            )
            .Select(row => (int?)row.Id)
            .SingleOrDefaultAsync(ct);

        return Result<ChoreographyVersionPage>.Success(
            await _history.VersionsOfAsync(copyId, query.Before, ct)
        );
    }

    public async Task<Result> DropChoreographyAsync(
        int accountId,
        ActEveningCommand evening,
        CancellationToken ct
    )
    {
        var act = await EditableEveningAsync(accountId, evening, ct);
        if (!act.IsSuccess)
            return Result.Carrying(act);

        var dropped = await _dbContext
            .Choreographies.Where(choreography =>
                choreography.ActId == evening.ActId
                && choreography.Appearance!.CalendarEntryId == evening.EventId
            )
            .ExecuteDeleteAsync(ct);

        return dropped == 0 ? Result.NotFound(NoOwnChoreographyMessage) : Result.Success();
    }

    private async Task<Result<ActSummary>> EditableEveningAsync(
        int accountId,
        ActEveningCommand evening,
        CancellationToken ct
    )
    {
        var act = await _gate.EditableActAsync(accountId, evening.ActId, ct);
        if (!act.IsSuccess)
            return act;

        var startsAt = await _dbContext
            .Events.Where(row => row.CalendarEntryId == evening.EventId && row.CancelledAt == null)
            .Select(row => (DateTimeOffset?)row.CalendarEntry!.StartsAt)
            .SingleOrDefaultAsync(ct);
        if (startsAt is not { } start)
            return Result<ActSummary>.NotFound(UnknownEveningMessage);

        return ClubClock.DayOf(start) < ClubClock.Today(_timeProvider)
            ? Result<ActSummary>.Conflict(PastEveningMessage)
            : act;
    }

    private async Task<Result<int>> AppearanceIdForAsync(
        ActEveningCommand evening,
        ActSummary act,
        CancellationToken ct
    ) => await _runningOrders.AppearanceForAsync(evening.EventId, act, ct);

    private async Task<Result<ChoreographyDocument>> CopyBaselineAsync(
        Choreography? copy,
        Choreography? session,
        SaveEveningChoreographyCommand command,
        CancellationToken ct
    )
    {
        var fromCopy = command.BaseVersion is not null;
        var baseline = fromCopy
            ? await _choreographies.BaselineAsync(copy, command.BaseVersion, ct)
            : await _choreographies.BaselineAsync(session, command.SessionVersion, ct);
        if (baseline is not null)
            return Result<ChoreographyDocument>.Success(baseline);

        return Result<ChoreographyDocument>.Conflict(
            fromCopy ? StaleCopyMessage : StaleSessionMessage
        );
    }

    private Task<Choreography?> CopyOfAsync(ActEveningCommand evening, CancellationToken ct) =>
        _dbContext.Choreographies.SingleOrDefaultAsync(
            row => row.ActId == evening.ActId && row.Appearance!.CalendarEntryId == evening.EventId,
            ct
        );

    private Task<Choreography?> SessionChoreographyAsync(int actId, CancellationToken ct) =>
        _dbContext.Choreographies.SingleOrDefaultAsync(
            row => row.ActId == actId && row.AppearanceId == null,
            ct
        );

    private async Task ReplaceCastChangeAsync(
        int appearanceId,
        int personId,
        CastChange? change,
        CancellationToken ct
    )
    {
        await _dbContext
            .AppearanceCastChanges.Where(row =>
                row.AppearanceId == appearanceId && row.PersonId == personId
            )
            .ExecuteDeleteAsync(ct);
        if (change is { } made)
            _dbContext.AppearanceCastChanges.Add(
                new AppearanceCastChange
                {
                    AppearanceId = appearanceId,
                    PersonId = personId,
                    Change = made,
                }
            );
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<IReadOnlyList<SpotAssignment>> SessionSpotsOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        await _dbContext
            .Spots.Where(spot => spot.ActId == actId)
            .OrderBy(spot => spot.Number)
            .Select(spot => new SpotAssignment(spot.Id, spot.PersonId))
            .ToListAsync(ct);

    private async Task<bool> DancesThatEveningAsync(
        ActSummary act,
        int eventId,
        int personId,
        CancellationToken ct
    )
    {
        var change = await _dbContext
            .AppearanceCastChanges.Where(row =>
                row.Appearance!.ActId == act.ActId
                && row.Appearance.CalendarEntryId == eventId
                && row.PersonId == personId
            )
            .Select(row => (CastChange?)row.Change)
            .SingleOrDefaultAsync(ct);

        return DancesThatEvening(act.Cast.Any(member => member.PersonId == personId), change);
    }

    private async Task ReplaceSpotChangesAsync(
        int appearanceId,
        IReadOnlyList<SpotAssignment> session,
        SpotAssignment assigned,
        CancellationToken ct
    )
    {
        var stored = await _dbContext
            .AppearanceSpots.Where(spot => spot.AppearanceId == appearanceId)
            .Select(spot => new SpotAssignment(spot.SpotId, spot.PersonId))
            .ToListAsync(ct);
        await _dbContext
            .AppearanceSpots.Where(spot => spot.AppearanceId == appearanceId)
            .ExecuteDeleteAsync(ct);
        _dbContext.AppearanceSpots.AddRange(
            SpotCasting
                .EveningChangesAfter(session, stored, assigned)
                .Select(change => new AppearanceSpot
                {
                    AppearanceId = appearanceId,
                    SpotId = change.SpotId,
                    PersonId = change.PersonId,
                })
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    private Choreography AddedCopy(int actId, int appearanceId, int? sessionVersion)
    {
        var copy = new Choreography
        {
            ActId = actId,
            AppearanceId = appearanceId,
            CopiedFromVersion = sessionVersion,
        };
        _dbContext.Choreographies.Add(copy);

        return copy;
    }

    [Pure]
    private static bool DancesThatEvening(bool inSessionCast, CastChange? change) =>
        change switch
        {
            CastChange.Added => true,
            CastChange.Removed => false,
            _ => inSessionCast,
        };
}
