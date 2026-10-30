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
    private const string StaleVersionMessage =
        "Die Aufstellung wurde inzwischen woanders geändert. Lade sie neu und ändere sie erneut.";
    private const string ProblemsMessage =
        "Die Aufstellung passt nicht zu den Plätzen, der Musik oder der Bühne des Auftritts.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ClubRecordService _clubRecords;

    public ActChoreographyService(
        AppDbContext dbContext,
        ActStudioGate gate,
        ClubRecordService clubRecords
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _clubRecords = clubRecords;
    }

    public async Task<Result<int>> SaveAsync(
        int accountId,
        SaveChoreographyCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);

        var choreography = await _dbContext.Choreographies.SingleOrDefaultAsync(
            row => row.ActId == command.ActId && row.AppearanceId == null,
            ct
        );
        if (choreography?.Version != command.ExpectedVersion)
            return Result<int>.Conflict(StaleVersionMessage);
        if (
            ChoreographyCheck
                .ProblemsOf(command.Document, await FrameOfAsync(command.ActId, ct))
                .Count > 0
        )
            return Result<int>.Validation(ProblemsMessage);

        var saved = choreography ?? AddedChoreography(command.ActId);
        Write(saved, command.Document);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(saved.Version);
    }

    private Choreography AddedChoreography(int actId)
    {
        var choreography = new Choreography { ActId = actId };
        _dbContext.Choreographies.Add(choreography);

        return choreography;
    }

    private static void Write(Choreography choreography, ChoreographyDocument document)
    {
        if (choreography.Id != 0)
            choreography.Version++;

        choreography.Document = document;
    }

    private async Task<ChoreographyFrame> FrameOfAsync(int actId, CancellationToken ct) =>
        new(
            await SpotIdsOfAsync(actId, ct),
            await MusicSourceIdsOfAsync(actId, ct),
            await MusicOfAsync(actId, ct),
            StageSizeOf(await _clubRecords.StageOfClubAsync(ct))
        );

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

    private async Task<ActMusic> MusicOfAsync(int actId, CancellationToken ct)
    {
        var adopted = await _dbContext
            .ActFinalTracks.Where(track => track.ActId == actId && track.AdoptedAt != null)
            .OrderByDescending(track => track.Version)
            .Select(track => new MusicCut(
                track.MediaItemId,
                0,
                track.MediaItem!.DurationSeconds ?? 0
            ))
            .FirstOrDefaultAsync(ct);
        if (adopted != default)
            return new ActMusic([adopted]);

        var songs = await _dbContext
            .ActSongs.Where(song => song.ActId == actId)
            .OrderBy(song => song.Position)
            .ThenBy(song => song.Id)
            .Select(song => new MusicCut(
                song.MediaItemId,
                song.StartSeconds,
                song.EndSeconds ?? song.MediaItem!.DurationSeconds ?? song.StartSeconds
            ))
            .ToListAsync(ct);

        return new ActMusic(songs);
    }

    [Pure]
    private static StageSize StageSizeOf(ClubStageDetails? stage) =>
        stage is null
            ? StageSize.Unconfigured
            : new StageSize((double)stage.WidthMetres, (double)stage.DepthMetres);
}
