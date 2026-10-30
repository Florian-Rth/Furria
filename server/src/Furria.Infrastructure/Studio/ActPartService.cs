using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActPartService
{
    private const string UnknownStepMessage = "Diesen Schritt gibt es im Auftritt nicht.";
    private const string UnknownPartMessage = "Diesen Teil gibt es im Auftritt nicht.";
    private const string UnknownVideoMessage = "Dieses Video gehört nicht zum Auftritt.";
    private const string StepAdriftMessage =
        "Die Musik dieses Schritts ist nicht mehr da, hier kann kein Teil beginnen.";
    private const string PartBeginsHereMessage = "Hier beginnt schon ein Teil.";
    private const string FirstPartMessage = "Der erste Teil beginnt immer mit dem ersten Schritt.";
    private const string BeyondANeighbourMessage =
        "Ein Teil beginnt zwischen dem Anfang des vorigen und dem des nächsten Teils.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTimelineReader _timelines;

    public ActPartService(AppDbContext dbContext, ActStudioGate gate, ActTimelineReader timelines)
    {
        _dbContext = dbContext;
        _gate = gate;
        _timelines = timelines;
    }

    public async Task<Result<int>> AddAsync(
        int accountId,
        AddActPartCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);
        if (!await IsStepOfAsync(command.ActId, command.FirstStepId, ct))
            return Result<int>.NotFound(UnknownStepMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        if (OpeningRefusalOf(timeline, command.FirstStepId) is { } refusal)
            return Result<int>.Conflict(refusal);

        await PullReachingPartBackAsync(timeline.Parts, command.FirstStepId, ct);
        var part = new ActPart
        {
            ActId = command.ActId,
            FirstStepId = command.FirstStepId,
            Name = command.Name.Trim(),
        };
        _dbContext.ActParts.Add(part);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result<int>.Success(part.Id);
    }

    public async Task<Result> SettleAsync(
        int accountId,
        ActPartSettingsCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var part = await _dbContext.ActParts.SingleOrDefaultAsync(
            row => row.Id == command.PartId && row.ActId == command.ActId,
            ct
        );
        if (part is null)
            return Result.NotFound(UnknownPartMessage);
        if (command.MainVideoId is { } videoId && !await IsVideoOfAsync(command.ActId, videoId, ct))
            return Result.NotFound(UnknownVideoMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var timeline = await _timelines.TimelineOfAsync(command.ActId, ct);
        if (!StartsAt(timeline.Parts, part, command.FirstStepId))
        {
            if (!await IsStepOfAsync(command.ActId, command.FirstStepId, ct))
                return Result.NotFound(UnknownStepMessage);
            if (MoveRefusalOf(timeline, part.Id, command.FirstStepId) is { } refusal)
                return refusal;
            await PullReachingPartBackAsync(timeline.Parts, command.FirstStepId, ct);
            part.FirstStepId = command.FirstStepId;
        }

        part.Name = command.Name.Trim();
        part.MainVideoId = command.MainVideoId;
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        RemoveActPartCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var removed = await _dbContext
            .ActParts.Where(part => part.Id == command.PartId && part.ActId == command.ActId)
            .ExecuteDeleteAsync(ct);

        return removed == 0 ? Result.NotFound(UnknownPartMessage) : Result.Success();
    }

    private async Task PullReachingPartBackAsync(PartTiling parts, int stepId, CancellationToken ct)
    {
        var reaching = await _dbContext.ActParts.SingleOrDefaultAsync(
            part => part.FirstStepId == stepId,
            ct
        );
        var span = parts.Spans.FirstOrDefault(candidate => candidate.PartId == reaching?.Id);
        if (reaching is null || span is null)
            return;

        reaching.FirstStepId = span.StepIds[0];
        await _dbContext.SaveChangesAsync(ct);
    }

    private Task<bool> IsStepOfAsync(int actId, int stepId, CancellationToken ct) =>
        _dbContext.ActSteps.AnyAsync(step => step.Id == stepId && step.ActId == actId, ct);

    private Task<bool> IsVideoOfAsync(int actId, int videoId, CancellationToken ct) =>
        _dbContext.ActVideos.AnyAsync(video => video.Id == videoId && video.ActId == actId, ct);

    [Pure]
    private static string? OpeningRefusalOf(ActTimeline timeline, int stepId) =>
        !timeline.Steps.Spans.Any(span => span.StepId == stepId) ? StepAdriftMessage
        : ActParts.StartsAPart(timeline.Parts, stepId) ? PartBeginsHereMessage
        : null;

    [Pure]
    private static bool StartsAt(PartTiling parts, ActPart part, int stepId) =>
        part.FirstStepId == stepId
        || parts.Spans.Any(span =>
            span.PartId == part.Id && span.StepIds.Count > 0 && span.StepIds[0] == stepId
        );

    [Pure]
    private static Result? MoveRefusalOf(ActTimeline timeline, int partId, int stepId) =>
        ActParts.RefusalToStartAt(timeline.Steps, timeline.Parts, partId, stepId) switch
        {
            null => null,
            PartMoveRefusal.Adrift => Result.Conflict(StepAdriftMessage),
            PartMoveRefusal.FirstPart => Result.Validation(FirstPartMessage),
            PartMoveRefusal.BeyondANeighbour => Result.Validation(BeyondANeighbourMessage),
            _ => throw new ArgumentOutOfRangeException(nameof(timeline), stepId, null),
        };
}
