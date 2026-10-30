using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActSpotService
{
    private const int RenumberingOffset = 1000;
    private const string FullStageMessage = "Mehr Plätze passen nicht in einen Auftritt.";
    private const string UnknownSpotMessage = "Diesen Platz gibt es im Auftritt nicht.";
    private const string NotInCastMessage = "Einen Platz bekommt nur, wer im Auftritt mitmacht.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ChoreographyHistory _history;

    public ActSpotService(AppDbContext dbContext, ActStudioGate gate, ChoreographyHistory history)
    {
        _dbContext = dbContext;
        _gate = gate;
        _history = history;
    }

    public async Task<Result<AddedSpotDetails>> AddAsync(
        int accountId,
        int actId,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, actId, ct);
        if (!editable.IsSuccess)
            return Result<AddedSpotDetails>.Carrying(editable);

        var numbers = await _dbContext
            .Spots.Where(spot => spot.ActId == actId)
            .Select(spot => spot.Number)
            .ToListAsync(ct);
        if (numbers.Count >= Spot.MostPerAct)
            return Result<AddedSpotDetails>.Conflict(FullStageMessage);

        var spot = new Spot
        {
            ActId = actId,
            Number = numbers.Count == 0 ? Spot.FirstNumber : numbers.Max() + 1,
        };
        _dbContext.Spots.Add(spot);
        await _dbContext.SaveChangesAsync(ct);

        return Result<AddedSpotDetails>.Success(
            new AddedSpotDetails { SpotId = spot.Id, Number = spot.Number }
        );
    }

    public async Task<Result> AssignAsync(
        int accountId,
        AssignSpotCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableActAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result.Carrying(editable);
        if (!await IsSpotOfAsync(command.ActId, command.SpotId, ct))
            return Result.NotFound(UnknownSpotMessage);
        if (command.PersonId is { } personId && !IsInCast(editable.Value, personId))
            return Result.Conflict(NotInCastMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await FreeOtherSpotOfAsync(command, ct);
        await _dbContext
            .Spots.Where(spot => spot.Id == command.SpotId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(spot => spot.PersonId, command.PersonId),
                ct
            );
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        RemoveSpotCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var number = await _dbContext
            .Spots.Where(spot => spot.Id == command.SpotId && spot.ActId == command.ActId)
            .Select(spot => (int?)spot.Number)
            .SingleOrDefaultAsync(ct);
        if (number is not { } removedNumber)
            return Result.NotFound(UnknownSpotMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await DropTracksOfAsync(accountId, command, ct);
        await _dbContext.Spots.Where(spot => spot.Id == command.SpotId).ExecuteDeleteAsync(ct);
        await CloseNumberGapAsync(command.ActId, removedNumber, ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private Task<bool> IsSpotOfAsync(int actId, int spotId, CancellationToken ct) =>
        _dbContext.Spots.AnyAsync(spot => spot.Id == spotId && spot.ActId == actId, ct);

    private static bool IsInCast(ActSummary act, int personId) =>
        act.Cast.Any(member => member.PersonId == personId);

    private Task<int> FreeOtherSpotOfAsync(AssignSpotCommand command, CancellationToken ct) =>
        _dbContext
            .Spots.Where(spot =>
                spot.ActId == command.ActId
                && spot.Id != command.SpotId
                && command.PersonId != null
                && spot.PersonId == command.PersonId
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(spot => spot.PersonId, (int?)null),
                ct
            );

    private async Task DropTracksOfAsync(
        int accountId,
        RemoveSpotCommand command,
        CancellationToken ct
    )
    {
        var choreographies = await _dbContext
            .Choreographies.Where(choreography => choreography.ActId == command.ActId)
            .ToListAsync(ct);

        foreach (var choreography in choreographies)
            await _history.WriteAsync(
                choreography,
                new ChoreographyWrite
                {
                    AccountId = accountId,
                    Document = choreography.Document.WithoutSpot(command.SpotId),
                    Kind = ChoreographyVersionKind.SpotRemoved,
                },
                ct
            );

        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task CloseNumberGapAsync(int actId, int removedNumber, CancellationToken ct)
    {
        await _dbContext
            .Spots.Where(spot => spot.ActId == actId && spot.Number > removedNumber)
            .ExecuteUpdateAsync(
                setters =>
                    setters.SetProperty(
                        spot => spot.Number,
                        spot => spot.Number + RenumberingOffset
                    ),
                ct
            );
        await _dbContext
            .Spots.Where(spot => spot.ActId == actId && spot.Number > RenumberingOffset)
            .ExecuteUpdateAsync(
                setters =>
                    setters.SetProperty(
                        spot => spot.Number,
                        spot => spot.Number - RenumberingOffset - 1
                    ),
                ct
            );
    }
}
