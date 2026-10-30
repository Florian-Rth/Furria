using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActStepService
{
    private const string UnknownStepMessage = "Diesen Schritt gibt es im Auftritt nicht.";
    private const string OutsideTheMusicMessage =
        "Hier ist keine Musik, auf die ein Schritt passt.";
    private const string OnABorderMessage = "Hier beginnt schon ein Schritt.";
    private const string AdriftMessage =
        "Die Musik dieses Schritts ist nicht mehr da, er lässt sich nicht verschieben.";
    private const string FirstStepMessage = "Der erste Schritt beginnt immer mit der Musik.";
    private const string BeyondANeighbourMessage =
        "Ein Schritt beginnt zwischen dem Anfang des vorigen und dem Ende des eigenen.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTimelineReader _timelines;

    public ActStepService(AppDbContext dbContext, ActStudioGate gate, ActTimelineReader timelines)
    {
        _dbContext = dbContext;
        _gate = gate;
        _timelines = timelines;
    }

    public async Task<Result<IReadOnlyList<int>>> MarkAsync(
        int accountId,
        MarkActStepCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<IReadOnlyList<int>>.Carrying(editable);

        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        var mark = ActSteps.MarkAt(timeline.Steps, command.AtSeconds, timeline.Music);
        if (mark.Refusal is { } refusal)
            return Result<IReadOnlyList<int>>.Validation(MessageOf(refusal));

        var steps = mark.NewStarts.Select(start => StepAt(command.ActId, start)).ToList();
        _dbContext.ActSteps.AddRange(steps);
        await _dbContext.SaveChangesAsync(ct);

        return Result<IReadOnlyList<int>>.Success([.. steps.Select(step => step.Id)]);
    }

    public async Task<Result> MoveAsync(
        int accountId,
        MoveActStepCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;
        if (!await IsStepOfAsync(command.ActId, command.StepId, ct))
            return Result.NotFound(UnknownStepMessage);

        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        var move = ActSteps.MoveTo(
            timeline.Steps,
            command.StepId,
            command.AtSeconds,
            timeline.Music
        );
        if (move.Refusal is { } refusal)
            return Result.Validation(MessageOf(refusal));

        var start = move.NewStarts[0];
        await _dbContext
            .ActSteps.Where(step => step.Id == command.StepId)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(step => step.StartSourceMediaItemId, start.SourceMediaItemId)
                        .SetProperty(step => step.StartSeconds, start.Seconds),
                ct
            );

        return Result.Success();
    }

    public async Task<Result> DescribeAsync(
        int accountId,
        ActStepTextCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var description = string.IsNullOrWhiteSpace(command.Description)
            ? null
            : command.Description.Trim();
        var described = await _dbContext
            .ActSteps.Where(step => step.Id == command.StepId && step.ActId == command.ActId)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(step => step.Name, command.Name.Trim())
                        .SetProperty(step => step.Description, description),
                ct
            );

        return described == 0 ? Result.NotFound(UnknownStepMessage) : Result.Success();
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        RemoveActStepCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var step = await _dbContext.ActSteps.SingleOrDefaultAsync(
            row => row.Id == command.StepId && row.ActId == command.ActId,
            ct
        );
        if (step is null)
            return Result.NotFound(UnknownStepMessage);

        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        await HandOnPartsStartingAtAsync(step.Id, timeline.Parts, ct);
        _dbContext.ActSteps.Remove(step);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task HandOnPartsStartingAtAsync(
        int stepId,
        PartTiling parts,
        CancellationToken ct
    )
    {
        var starting = await _dbContext
            .ActParts.Where(part => part.FirstStepId == stepId)
            .ToListAsync(ct);

        foreach (var part in starting)
            if (ActParts.HeirOf(parts, part.Id, stepId) is { } heir)
                part.FirstStepId = heir;
            else
                _dbContext.ActParts.Remove(part);
        await _dbContext.SaveChangesAsync(ct);
    }

    private Task<bool> IsStepOfAsync(int actId, int stepId, CancellationToken ct) =>
        _dbContext.ActSteps.AnyAsync(step => step.Id == stepId && step.ActId == actId, ct);

    [Pure]
    private static ActStep StepAt(int actId, MusicAnchor start) =>
        new()
        {
            ActId = actId,
            StartSourceMediaItemId = start.SourceMediaItemId,
            StartSeconds = start.Seconds,
        };

    [Pure]
    private static string MessageOf(StepMarkRefusal refusal) =>
        refusal switch
        {
            StepMarkRefusal.OnABorder => OnABorderMessage,
            StepMarkRefusal.Adrift => AdriftMessage,
            StepMarkRefusal.FirstStep => FirstStepMessage,
            StepMarkRefusal.BeyondANeighbour => BeyondANeighbourMessage,
            StepMarkRefusal.OutsideTheMusic => OutsideTheMusicMessage,
            _ => throw new ArgumentOutOfRangeException(nameof(refusal), refusal, null),
        };
}
