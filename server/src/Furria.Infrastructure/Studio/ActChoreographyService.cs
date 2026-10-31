using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Studio;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActChoreographyService
{
    private const int MostSaveAttempts = 3;
    private const string StaleVersionMessage =
        "Die Aufstellung wurde inzwischen woanders geändert. Lade sie neu und ändere sie erneut.";

    public const string ProblemsMessage =
        "Die Aufstellung passt nicht zu den Plätzen, der Musik oder der Bühne des Auftritts.";

    public const string UnknownVersionMessage = "Diese Fassung der Aufstellung gibt es nicht.";

    public const string OutdatedVersionMessage =
        "Diese Fassung ist älter als die übernommene Endfassung und passt nicht mehr zur Musik.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ClubRecordService _clubRecords;
    private readonly ChoreographyHistory _history;
    private readonly ActTimelineReader _timelines;

    public ActChoreographyService(
        AppDbContext dbContext,
        ActStudioGate gate,
        ClubRecordService clubRecords,
        ChoreographyHistory history,
        ActTimelineReader timelines
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _clubRecords = clubRecords;
        _history = history;
        _timelines = timelines;
    }

    public async Task<Result<ChoreographySaveDetails>> SaveAsync(
        int accountId,
        SaveChoreographyCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<ChoreographySaveDetails>.Carrying(editable);

        return await RemergedOnLostRaceAsync(() => MergeAndSaveAsync(accountId, command, ct));
    }

    public async Task<Result<ChoreographySaveDetails>> RemergedOnLostRaceAsync(
        Func<Task<Result<ChoreographySaveDetails>>> save
    )
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await save();
            }
            catch (Exception exception)
                when (attempt < MostSaveAttempts && LostWriteRace.Caused(exception))
            {
                _dbContext.ChangeTracker.Clear();
            }
        }
    }

    private async Task<Result<ChoreographySaveDetails>> MergeAndSaveAsync(
        int accountId,
        SaveChoreographyCommand command,
        CancellationToken ct
    )
    {
        var choreography = await SessionChoreographyAsync(command.ActId, ct);
        var baseline = await BaselineAsync(choreography, command.BaseVersion, ct);
        if (baseline is null)
            return Result<ChoreographySaveDetails>.Conflict(StaleVersionMessage);

        var merge = await MergeAsync(
            new ChoreographyMergeQuery
            {
                ActId = command.ActId,
                Baseline = baseline,
                Current = choreography?.Document ?? ChoreographyDocument.Empty,
                ChangedTracks = command.ChangedTracks,
            },
            ct
        );
        if (!merge.IsSuccess || !merge.Value.IsClean)
            return OverlapsOrRefusal(merge);
        if (choreography is not null && merge.Value.Document.Matches(choreography.Document))
            return Saved(choreography.Version);

        var saved = choreography ?? AddedChoreography(command.ActId);
        await _history.WriteAsync(saved, SavedBy(accountId, merge.Value.Document), ct);
        await _dbContext.SaveChangesAsync(ct);

        return Saved(saved.Version);
    }

    public async Task<Result<int>> RestoreAsync(
        int accountId,
        RestoreChoreographyCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);

        var choreography = await SessionChoreographyAsync(command.ActId, ct);
        if (choreography is null)
            return Result<int>.NotFound(UnknownVersionMessage);

        var restored = await RestoredDocumentAsync(choreography, command.Version, ct);
        if (!restored.IsSuccess)
            return Result<int>.Carrying(restored);

        await _history.WriteAsync(
            choreography,
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

        return Result<int>.Success(choreography.Version);
    }

    public async Task<Result<ChoreographyVersionPage>> VersionsAsync(
        int accountId,
        ActChoreographyVersionsQuery query,
        CancellationToken ct
    )
    {
        var act = await _gate.EditorsActAsync(accountId, query.ActId, ct);
        if (!act.IsSuccess)
            return Result<ChoreographyVersionPage>.Carrying(act);

        var choreographyId = await _dbContext
            .Choreographies.Where(row => row.ActId == query.ActId && row.AppearanceId == null)
            .Select(row => (int?)row.Id)
            .SingleOrDefaultAsync(ct);

        return Result<ChoreographyVersionPage>.Success(
            await _history.VersionsOfAsync(choreographyId, query.Before, ct)
        );
    }

    public async Task<ChoreographyDocument?> BaselineAsync(
        Choreography? choreography,
        int? baseVersion,
        CancellationToken ct
    )
    {
        if (baseVersion is not { } version)
            return ChoreographyDocument.Empty;
        if (choreography is null)
            return null;
        if (version == choreography.Version)
            return choreography.Document;

        return await _history.MusicAdoptedSinceAsync(choreography, version, ct)
            ? null
            : await _history.DocumentAtAsync(choreography, version, ct);
    }

    public async Task<Result<ChoreographyMerge>> MergeAsync(
        ChoreographyMergeQuery query,
        CancellationToken ct
    )
    {
        var frame = await FrameOfAsync(query.ActId, ct);
        var merge = ChoreographyMerging.Merged(
            query.Baseline,
            query.Current,
            query.ChangedTracks,
            frame.Music
        );

        return merge.IsClean && ChoreographyCheck.ProblemsOf(merge.Document, frame).Count > 0
            ? Result<ChoreographyMerge>.Validation(ProblemsMessage)
            : Result<ChoreographyMerge>.Success(merge);
    }

    public async Task<Result<ChoreographyDocument>> RestoredDocumentAsync(
        Choreography choreography,
        int version,
        CancellationToken ct
    )
    {
        var document = await _history.DocumentAtAsync(choreography, version, ct);
        if (document is null)
            return Result<ChoreographyDocument>.NotFound(UnknownVersionMessage);
        if (await _history.MusicAdoptedSinceAsync(choreography, version, ct))
            return Result<ChoreographyDocument>.Conflict(OutdatedVersionMessage);

        var frame = await FrameOfAsync(choreography.ActId, ct);
        var restored = OnTheSpotsOf(document, frame);

        return ChoreographyCheck.ProblemsOf(restored, frame).Count > 0
            ? Result<ChoreographyDocument>.Validation(ProblemsMessage)
            : Result<ChoreographyDocument>.Success(restored);
    }

    public async Task<ChoreographyFrame> FrameOfAsync(int actId, CancellationToken ct) =>
        new(
            await SpotIdsOfAsync(actId, ct),
            await MusicSourceIdsOfAsync(actId, ct),
            await _timelines.PlayedMusicOfAsync(actId, ct),
            StageSizeOf(await _clubRecords.StageOfClubAsync(ct))
        );

    [Pure]
    public static ChoreographyWrite SavedBy(int accountId, ChoreographyDocument document) =>
        new()
        {
            AccountId = accountId,
            Document = document,
            Kind = ChoreographyVersionKind.Saved,
        };

    [Pure]
    public static Result<ChoreographySaveDetails> Saved(int version) =>
        Result<ChoreographySaveDetails>.Success(
            new ChoreographySaveDetails { Version = version, Overlaps = [] }
        );

    [Pure]
    public static Result<ChoreographySaveDetails> OverlapsOrRefusal(
        Result<ChoreographyMerge> merge
    ) =>
        merge.IsSuccess
            ? Result<ChoreographySaveDetails>.Success(
                new ChoreographySaveDetails { Version = null, Overlaps = merge.Value.Overlaps }
            )
            : Result<ChoreographySaveDetails>.Carrying(merge);

    [Pure]
    private static ChoreographyDocument OnTheSpotsOf(
        ChoreographyDocument document,
        ChoreographyFrame frame
    ) => new([.. document.Tracks.Where(track => frame.SpotIds.Contains(track.SpotId))]);

    private Task<Choreography?> SessionChoreographyAsync(int actId, CancellationToken ct) =>
        _dbContext.Choreographies.SingleOrDefaultAsync(
            row => row.ActId == actId && row.AppearanceId == null,
            ct
        );

    private Choreography AddedChoreography(int actId)
    {
        var choreography = new Choreography { ActId = actId };
        _dbContext.Choreographies.Add(choreography);

        return choreography;
    }

    private async Task<IReadOnlySet<int>> SpotIdsOfAsync(int actId, CancellationToken ct) =>
        (
            await _dbContext
                .Spots.Where(spot => spot.ActId == actId)
                .Select(spot => spot.Id)
                .ToListAsync(ct)
        ).ToHashSet();

    private async Task<IReadOnlySet<int>> MusicSourceIdsOfAsync(int actId, CancellationToken ct) =>
        (
            await _dbContext
                .MediaItems.Where(item =>
                    item.OwnerKind == MediaOwnerKind.Act
                    && item.OwnerActId == actId
                    && item.Kind == MediaKind.Audio
                )
                .Select(item => item.Id)
                .ToListAsync(ct)
        ).ToHashSet();

    [Pure]
    private static StageSize StageSizeOf(ClubStageDetails? stage) =>
        stage is null
            ? StageSize.Unconfigured
            : new StageSize((double)stage.WidthMetres, (double)stage.DepthMetres);
}
