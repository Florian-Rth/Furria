using System.Diagnostics;
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
    private const string AdriftMessage =
        "Die Musik dieses Schritts ist nicht mehr da, er lässt sich nicht verschieben.";
    private const string OverlapsAStepMessage = "Hier liegt schon ein Schritt.";
    private const string TooShortMessage = "Ein Schritt endet erst nach seinem Anfang.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTimelineReader _timelines;

    public ActStepService(AppDbContext dbContext, ActStudioGate gate, ActTimelineReader timelines)
    {
        _dbContext = dbContext;
        _gate = gate;
        _timelines = timelines;
    }

    public async Task<Result<int>> CreateAsync(
        int accountId,
        CreateActStepCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockStepsOfActAsync(command.ActId, ct);
        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        var creation = ActSteps.Create(
            timeline.Steps,
            command.StartSeconds,
            command.EndSeconds,
            timeline.Music
        );
        if (creation.Refusal is { } refusal)
            return Result<int>.Validation(MessageOf(refusal));

        var step = creation switch
        {
            { Split: { } split, Start: { } start } => await SplitAsync(
                timeline.Parts,
                split,
                start,
                ct
            ),
            { Start: { } start, End: { } end } => await AddedAsync(command.ActId, start, end, ct),
            _ => throw new UnreachableException(),
        };
        await transaction.CommitAsync(ct);

        return Result<int>.Success(step.Id);
    }

    public Task<Result> MoveStartAsync(
        int accountId,
        MoveActStepCommand command,
        CancellationToken ct
    ) => MoveBorderAsync(accountId, command, ActSteps.MoveStart, StartTo, ct);

    public Task<Result> MoveEndAsync(
        int accountId,
        MoveActStepCommand command,
        CancellationToken ct
    ) => MoveBorderAsync(accountId, command, ActSteps.MoveEnd, EndTo, ct);

    public async Task<Result> RenameAsync(
        int accountId,
        RenameActStepCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var renamed = await _dbContext
            .ActSteps.Where(step => step.Id == command.StepId && step.ActId == command.ActId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(step => step.Name, command.Name.Trim()),
                ct
            );

        return renamed == 0 ? Result.NotFound(UnknownStepMessage) : Result.Success();
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
        await _dbContext.LockStepsOfActAsync(command.ActId, ct);
        var step = await _dbContext.ActSteps.SingleOrDefaultAsync(
            row => row.Id == command.StepId && row.ActId == command.ActId,
            ct
        );
        if (step is null)
            return Result.NotFound(UnknownStepMessage);

        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        await ShrinkPartsEndingOnAsync(step.Id, timeline.Parts, ct);
        _dbContext.ActSteps.Remove(step);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<Result> MoveBorderAsync(
        int accountId,
        MoveActStepCommand command,
        Func<StepTiling, int, double, ActMusic, StepBorderMove> move,
        Action<ActStep, MusicAnchor> apply,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockStepsOfActAsync(command.ActId, ct);
        var step = await _dbContext.ActSteps.SingleOrDefaultAsync(
            row => row.Id == command.StepId && row.ActId == command.ActId,
            ct
        );
        if (step is null)
            return Result.NotFound(UnknownStepMessage);

        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        var moved = move(timeline.Steps, command.StepId, command.AtSeconds, timeline.Music);
        if (moved.Refusal is { } refusal)
            return Result.Validation(MessageOf(refusal));

        apply(step, moved.Anchor ?? throw new UnreachableException());
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<ActStep> AddedAsync(
        int actId,
        MusicAnchor start,
        MusicAnchor end,
        CancellationToken ct
    )
    {
        var step = StepBetween(actId, start, end);
        _dbContext.ActSteps.Add(step);
        await _dbContext.SaveChangesAsync(ct);

        return step;
    }

    private async Task<ActStep> SplitAsync(
        PartTiling parts,
        StepSplit split,
        MusicAnchor start,
        CancellationToken ct
    )
    {
        var head = await _dbContext.ActSteps.SingleAsync(step => step.Id == split.StepId, ct);
        var tail = StepBetween(
            head.ActId,
            start,
            new MusicAnchor(head.EndSourceMediaItemId, head.EndSeconds)
        );
        tail.EndNeedsCheck = head.EndNeedsCheck;
        EndTo(head, split.NewEnd);
        _dbContext.ActSteps.Add(tail);
        await _dbContext.SaveChangesAsync(ct);
        await KeepSplitHalvesInTheirPartAsync(parts, split.StepId, tail.Id, ct);

        return tail;
    }

    private async Task ShrinkPartsEndingOnAsync(int stepId, PartTiling parts, CancellationToken ct)
    {
        var ending = await _dbContext
            .ActParts.Where(part => part.FirstStepId == stepId || part.LastStepId == stepId)
            .ToListAsync(ct);

        foreach (var part in ending)
            if (
                ActParts.Without(
                    parts,
                    new PartRange(part.Id, part.FirstStepId, part.LastStepId),
                    stepId
                ) is
                { } shrunk
            )
                Reach(part, shrunk);
            else
                _dbContext.ActParts.Remove(part);
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task KeepSplitHalvesInTheirPartAsync(
        PartTiling parts,
        int splitStepId,
        int newStepId,
        CancellationToken ct
    )
    {
        var reaching = ActParts.ReachingInto(parts, splitStepId, newStepId);
        if (reaching.Count == 0)
            return;

        var partIds = reaching.Select(range => range.PartId).ToList();
        var stored = await _dbContext
            .ActParts.Where(part => partIds.Contains(part.Id))
            .ToDictionaryAsync(part => part.Id, ct);
        foreach (var range in reaching)
            Reach(stored[range.PartId], range);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static void Reach(ActPart part, PartRange range)
    {
        part.FirstStepId = range.FirstStepId;
        part.LastStepId = range.LastStepId;
    }

    private static void StartTo(ActStep step, MusicAnchor start)
    {
        step.StartSourceMediaItemId = start.SourceMediaItemId;
        step.StartSeconds = start.Seconds;
        step.StartNeedsCheck = false;
    }

    private static void EndTo(ActStep step, MusicAnchor end)
    {
        step.EndSourceMediaItemId = end.SourceMediaItemId;
        step.EndSeconds = end.Seconds;
        step.EndNeedsCheck = false;
    }

    [Pure]
    private static ActStep StepBetween(int actId, MusicAnchor start, MusicAnchor end) =>
        new()
        {
            ActId = actId,
            StartSourceMediaItemId = start.SourceMediaItemId,
            StartSeconds = start.Seconds,
            EndSourceMediaItemId = end.SourceMediaItemId,
            EndSeconds = end.Seconds,
        };

    [Pure]
    private static string MessageOf(StepRefusal refusal) =>
        refusal switch
        {
            StepRefusal.OutsideTheMusic => OutsideTheMusicMessage,
            StepRefusal.Adrift => AdriftMessage,
            StepRefusal.OverlapsAStep => OverlapsAStepMessage,
            StepRefusal.TooShort => TooShortMessage,
            _ => throw new ArgumentOutOfRangeException(nameof(refusal), refusal, null),
        };
}
