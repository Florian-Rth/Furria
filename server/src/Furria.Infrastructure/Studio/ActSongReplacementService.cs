using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActSongReplacementService
{
    private const string UnknownSongMessage = "Diesen Song gibt es im Auftritt nicht.";
    private const string UnknownFileMessage = "Diese Musikdatei gehört nicht zum Auftritt.";
    private const string FailedMessage = "Die neue Datei ließ sich nicht vorbereiten.";
    private const string DevelopingMessage = "Die neue Datei wird noch ausgewertet.";
    private const string MusicDevelopingMessage = "Die Musik wird noch ausgewertet.";
    private const string NotANeighbourMessage =
        "Mit ersetzt werden können nur Songs, die direkt vor oder nach diesem Song spielen.";
    private const string FileIsAnotherSongMessage =
        "Diese Datei ist schon ein anderer Song der Musik.";
    private const string NoMatchMessage = "Die neue Datei passt nicht zu diesen Songs.";
    private const string StaleSongsMessage =
        "Die Songs haben sich inzwischen geändert. Lade die Musik neu und ersetze erneut.";
    private const string NothingToUndoMessage = "Hier gibt es nichts mehr rückgängig zu machen.";
    private const string ChangedSinceMessage =
        "Seit dem Ersetzen wurde der Tanz geändert. Rückgängig ist nicht mehr möglich.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly SoundProfiles _profiles;
    private readonly ChoreographyHistory _history;

    public ActSongReplacementService(
        AppDbContext dbContext,
        ActStudioGate gate,
        SoundProfiles profiles,
        ChoreographyHistory history
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _profiles = profiles;
        _history = history;
    }

    public async Task<Result<IReadOnlyList<FoundSongSummary>>> MatchAsync(
        int accountId,
        ActSongReplacementQuery query,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, query.ActId, ct);
        if (!editable.IsSuccess)
            return Result<IReadOnlyList<FoundSongSummary>>.Carrying(editable);

        var newFile = await NewFileAsync(query.ActId, query.MediaItemId, ct);
        if (!newFile.IsSuccess)
            return Result<IReadOnlyList<FoundSongSummary>>.Carrying(newFile);

        var chain = await ChainOfAsync(query.ActId, ct);
        var songIndex = chain.FindIndex(song => song.Snapshot.SongId == query.SongId);
        if (songIndex < 0)
            return Result<IReadOnlyList<FoundSongSummary>>.NotFound(UnknownSongMessage);

        var sounds = await AnalysedSoundsOfAsync(chain, ct);
        if (sounds[songIndex] is null)
            return Result<IReadOnlyList<FoundSongSummary>>.Conflict(MusicDevelopingMessage);

        var run = SongMatching.RunAround(newFile.Value.Profile, sounds, songIndex);
        IReadOnlyList<ChainSong> runSongs = run is null
            ? [chain[songIndex]]
            : chain.GetRange(run.FirstIndex, run.Songs.Count);
        if (IsAnotherSong(chain, runSongs, query.MediaItemId))
            return Result<IReadOnlyList<FoundSongSummary>>.Conflict(FileIsAnotherSongMessage);

        return Result<IReadOnlyList<FoundSongSummary>>.Success(
            run is null ? [] : SummariesOf(run, runSongs, newFile.Value.LengthSeconds)
        );
    }

    public async Task<Result<int>> ReplaceAsync(
        int accountId,
        ReplaceActSongCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);

        var newFile = await NewFileAsync(command.ActId, command.MediaItemId, ct);
        if (!newFile.IsSuccess)
            return Result<int>.Carrying(newFile);

        var matched = await MatchedRunAsync(newFile.Value, command, ct);
        if (!matched.IsSuccess)
            return Result<int>.Carrying(matched);

        var heardVideoStarts = await HeardVideoStartsAsync(
            command.ActId,
            newFile.Value.Profile,
            matched.Value.Songs,
            ct
        );
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockStepsOfActAsync(command.ActId, ct);
        var chain = await ChainOfAsync(command.ActId, ct);
        var songs = SongsToReplaceOf(chain, command);
        if (!songs.IsSuccess || !songs.Value.SequenceEqual(matched.Value.Songs))
            return Result<int>.Conflict(StaleSongsMessage);

        var steps = await StepBordersOfAsync(command.ActId, ct);
        var replacement = ReplacementOf(newFile.Value, chain, matched.Value, steps);
        var newSongId = await ReplaceInPlaceAsync(
            accountId,
            songs.Value,
            new ReplacementWork(replacement, steps, heardVideoStarts),
            ct
        );
        await transaction.CommitAsync(ct);

        return Result<int>.Success(newSongId);
    }

    public async Task<Result> UndoAsync(
        int accountId,
        UndoActSongReplacementCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        await _dbContext.LockStepsOfActAsync(command.ActId, ct);
        var replacement = await _dbContext
            .ActMusicReplacements.AsNoTracking()
            .SingleOrDefaultAsync(
                row => row.ActId == command.ActId && row.SongId == command.SongId,
                ct
            );
        if (replacement is null)
            return Result.NotFound(NothingToUndoMessage);

        var choreography = await _history.ChoreographyOfAsync(command.ActId, ct);
        var state = await StateOfAsync(command.ActId, choreography?.Version, ct);
        if (state.Fingerprint() != replacement.Fingerprint)
            return Result.Conflict(ChangedSinceMessage);

        await RestoreAsync(accountId, replacement, choreography, ct);
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<Result<NewFile>> NewFileAsync(
        int actId,
        int mediaItemId,
        CancellationToken ct
    )
    {
        var item = await _dbContext
            .MediaItems.AsNoTracking()
            .SingleOrDefaultAsync(
                item =>
                    item.Id == mediaItemId
                    && item.OwnerKind == MediaOwnerKind.Act
                    && item.OwnerActId == actId
                    && item.Kind == MediaKind.Audio,
                ct
            );
        if (item is null)
            return Result<NewFile>.NotFound(UnknownFileMessage);

        var length = ReadyLengthOf(item);
        if (!length.IsSuccess)
            return Result<NewFile>.Carrying(length);

        return await _profiles.ProfileOfAsync(item.StorageKey, ct) is { } profile
            ? Result<NewFile>.Success(new NewFile(item.Id, length.Value, profile))
            : Result<NewFile>.Conflict(DevelopingMessage);
    }

    private async Task<Result<MatchedRun>> MatchedRunAsync(
        NewFile newFile,
        ReplaceActSongCommand command,
        CancellationToken ct
    )
    {
        var songs = SongsToReplaceOf(await ChainOfAsync(command.ActId, ct), command);
        if (!songs.IsSuccess)
            return Result<MatchedRun>.Carrying(songs);

        var sounds = await AnalysedSoundsOfAsync(songs.Value, ct);
        if (sounds.Any(sound => sound is null))
            return Result<MatchedRun>.Conflict(MusicDevelopingMessage);

        IReadOnlyList<CutSound> heard = [.. sounds.OfType<CutSound>()];
        return SongMatching.FoundInOrder(newFile.Profile, heard) is { } found
            ? Result<MatchedRun>.Success(new MatchedRun(songs.Value, heard, found))
            : Result<MatchedRun>.Validation(NoMatchMessage);
    }

    private async Task<IReadOnlyDictionary<int, double>> HeardVideoStartsAsync(
        int actId,
        SoundProfile newFile,
        IReadOnlyList<ChainSong> replaced,
        CancellationToken ct
    )
    {
        var replacedFileIds = replaced.Select(song => song.Snapshot.MediaItemId).ToList();
        var videos = await _dbContext
            .ActVideos.AsNoTracking()
            .Where(video =>
                video.ActId == actId
                && video.StartSourceMediaItemId != null
                && replacedFileIds.Contains(video.StartSourceMediaItemId.Value)
                && video.MediaItem!.State == MediaItemState.Ready
            )
            .Select(video => new { video.Id, video.MediaItem!.StorageKey })
            .ToListAsync(ct);

        var heardStarts = new Dictionary<int, double>();
        foreach (var video in videos)
            if (
                await _profiles.ProfileOfAsync(video.StorageKey, ct) is { } soundtrack
                && VideoMatching.StartIn(newFile, soundtrack) is { } startSeconds
            )
                heardStarts[video.Id] = startSeconds;

        return heardStarts;
    }

    private async Task<int> ReplaceInPlaceAsync(
        int accountId,
        IReadOnlyList<ChainSong> songs,
        ReplacementWork work,
        CancellationToken ct
    )
    {
        var actId = songs[0].ActId;
        var replacement = work.Replacement;
        var videos = await PlacedVideosOfAsync(actId, ct);
        var choreography = await _history.ChoreographyOfAsync(actId, ct);
        var before = new MusicBeforeReplacement(
            [.. songs.Select(song => song.Snapshot)],
            work.Steps,
            videos,
            choreography?.Document
        );

        await ApplyStepsAsync(actId, replacement.RewrittenSteps(work.Steps), ct);
        await ApplyVideosAsync(actId, [.. videos.Select(video => Rewritten(video, work))], ct);
        await WriteChoreographyAsync(
            accountId,
            choreography,
            ChoreographyAfter(before, replacement),
            ct
        );
        var newSong = await SwapInNewSongAsync(songs, replacement, ct);
        await _dbContext.SaveChangesAsync(ct);

        await KeepUndoAsync(newSong, before, choreography?.Version, ct);
        return newSong.Id;
    }

    private async Task<ActSong> SwapInNewSongAsync(
        IReadOnlyList<ChainSong> songs,
        SongReplacement replacement,
        CancellationToken ct
    )
    {
        var songIds = songs.Select(song => song.Snapshot.SongId).ToList();
        await _dbContext.ActSongs.Where(song => songIds.Contains(song.Id)).ExecuteDeleteAsync(ct);

        var newSong = NewSongOf(songs[0], replacement);
        _dbContext.ActSongs.Add(newSong);

        return newSong;
    }

    private async Task KeepUndoAsync(
        ActSong newSong,
        MusicBeforeReplacement before,
        int? choreographyVersion,
        CancellationToken ct
    )
    {
        await _dbContext
            .ActMusicReplacements.Where(row => row.ActId == newSong.ActId)
            .ExecuteDeleteAsync(ct);
        var after = await StateOfAsync(newSong.ActId, choreographyVersion, ct);
        _dbContext.ActMusicReplacements.Add(
            new ActMusicReplacement
            {
                ActId = newSong.ActId,
                SongId = newSong.Id,
                Before = before,
                Fingerprint = after.Fingerprint(),
            }
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task RestoreAsync(
        int accountId,
        ActMusicReplacement replacement,
        Choreography? choreography,
        CancellationToken ct
    )
    {
        var before = replacement.Before;
        await _dbContext
            .ActSongs.Where(song => song.Id == replacement.SongId)
            .ExecuteDeleteAsync(ct);
        _dbContext.ActSongs.AddRange(before.Songs.Select(song => SongOf(replacement.ActId, song)));
        await ApplyStepsAsync(replacement.ActId, before.Steps, ct);
        await ApplyVideosAsync(replacement.ActId, before.Videos, ct);
        await WriteChoreographyAsync(accountId, choreography, before.Choreography, ct);
    }

    private async Task ApplyStepsAsync(
        int actId,
        IReadOnlyList<StepBorders> borders,
        CancellationToken ct
    )
    {
        var byStep = borders.ToDictionary(step => step.StepId);
        var stepIds = byStep.Keys.ToList();
        var steps = await _dbContext
            .ActSteps.Where(step => step.ActId == actId && stepIds.Contains(step.Id))
            .ToListAsync(ct);
        foreach (var step in steps)
            Anchor(step, byStep[step.Id]);
    }

    private async Task ApplyVideosAsync(
        int actId,
        IReadOnlyList<PlacedVideo> placements,
        CancellationToken ct
    )
    {
        var byVideo = placements.ToDictionary(video => video.VideoId);
        var videoIds = byVideo.Keys.ToList();
        var videos = await _dbContext
            .ActVideos.Where(video => video.ActId == actId && videoIds.Contains(video.Id))
            .ToListAsync(ct);
        foreach (var video in videos)
            Place(video, byVideo[video.Id].Start);
    }

    private async Task WriteChoreographyAsync(
        int accountId,
        Choreography? choreography,
        ChoreographyDocument? document,
        CancellationToken ct
    )
    {
        if (choreography is null || document is null)
            return;

        await _history.WriteAsync(
            choreography,
            new ChoreographyWrite
            {
                AccountId = accountId,
                Document = document,
                Kind = ChoreographyVersionKind.MusicReplaced,
            },
            ct
        );
    }

    private async Task<List<ChainSong>> ChainOfAsync(int actId, CancellationToken ct) =>
        [
            .. (
                await _dbContext
                    .ActSongs.AsNoTracking()
                    .Where(song => song.ActId == actId)
                    .OrderBy(song => song.Position)
                    .ThenBy(song => song.Id)
                    .Select(song => new
                    {
                        Snapshot = new SongSnapshot(
                            song.Id,
                            song.MediaItemId,
                            song.Position,
                            song.StartSeconds,
                            song.EndSeconds,
                            song.FirstBeatSeconds,
                            song.TempoBpm
                        ),
                        song.ActId,
                        song.MediaItem!.StorageKey,
                        song.MediaItem.DurationSeconds,
                    })
                    .ToListAsync(ct)
            ).Select(row => new ChainSong(
                row.ActId,
                row.Snapshot,
                MusicCut.OfSong(
                    row.Snapshot.MediaItemId,
                    row.Snapshot.StartSeconds,
                    row.Snapshot.EndSeconds,
                    row.DurationSeconds
                ),
                row.StorageKey
            )),
        ];

    private async Task<IReadOnlyList<CutSound?>> AnalysedSoundsOfAsync(
        IReadOnlyList<ChainSong> songs,
        CancellationToken ct
    )
    {
        var profiles = new Dictionary<Guid, SoundProfile?>();
        foreach (var storageKey in songs.Select(song => song.StorageKey).Distinct())
            profiles[storageKey] = await _profiles.ProfileOfAsync(storageKey, ct);

        return
        [
            .. songs.Select(song =>
                profiles[song.StorageKey] is { } profile ? new CutSound(song.Cut, profile) : null
            ),
        ];
    }

    private async Task<ActMusicState> StateOfAsync(
        int actId,
        int? choreographyVersion,
        CancellationToken ct
    ) =>
        new(
            [.. (await ChainOfAsync(actId, ct)).Select(song => song.Snapshot)],
            await StepBordersOfAsync(actId, ct),
            await PlacedVideosOfAsync(actId, ct),
            choreographyVersion
        );

    private async Task<IReadOnlyList<StepBorders>> StepBordersOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        [
            .. (
                await _dbContext
                    .ActSteps.AsNoTracking()
                    .Where(step => step.ActId == actId)
                    .ToListAsync(ct)
            ).Select(BordersOf),
        ];

    private async Task<IReadOnlyList<PlacedVideo>> PlacedVideosOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        [
            .. (
                await _dbContext
                    .ActVideos.AsNoTracking()
                    .Where(video =>
                        video.ActId == actId
                        && video.StartSourceMediaItemId != null
                        && video.StartSeconds != null
                    )
                    .ToListAsync(ct)
            ).Select(PlacedVideoOf),
        ];

    [Pure]
    private static Result<double> ReadyLengthOf(MediaItem item) =>
        item.State == MediaItemState.Failed ? Result<double>.Conflict(FailedMessage)
        : item is { State: MediaItemState.Ready, DurationSeconds: { } lengthSeconds }
            ? Result<double>.Success(lengthSeconds)
        : Result<double>.Conflict(DevelopingMessage);

    [Pure]
    private static Result<IReadOnlyList<ChainSong>> SongsToReplaceOf(
        List<ChainSong> chain,
        ReplaceActSongCommand command
    )
    {
        var indices = command
            .WithSongIds.Append(command.SongId)
            .Select(songId => chain.FindIndex(song => song.Snapshot.SongId == songId))
            .Order()
            .ToList();
        if (indices[0] < 0)
            return Result<IReadOnlyList<ChainSong>>.NotFound(UnknownSongMessage);
        if (indices[^1] - indices[0] != indices.Count - 1)
            return Result<IReadOnlyList<ChainSong>>.Validation(NotANeighbourMessage);

        var songs = chain.GetRange(indices[0], indices.Count);
        return IsAnotherSong(chain, songs, command.MediaItemId)
            ? Result<IReadOnlyList<ChainSong>>.Conflict(FileIsAnotherSongMessage)
            : Result<IReadOnlyList<ChainSong>>.Success(songs);
    }

    [Pure]
    private static bool IsAnotherSong(
        IReadOnlyList<ChainSong> chain,
        IReadOnlyList<ChainSong> replaced,
        int mediaItemId
    ) => chain.Except(replaced).Any(song => song.Snapshot.MediaItemId == mediaItemId);

    [Pure]
    private static IReadOnlyList<FoundSongSummary> SummariesOf(
        SongRun run,
        IReadOnlyList<ChainSong> runSongs,
        double lengthSeconds
    ) =>
        [
            .. run
                .Songs.Zip(runSongs)
                .Select(pair => new FoundSongSummary
                {
                    SongId = pair.Second.Snapshot.SongId,
                    StartSeconds = Math.Clamp(pair.First.NewStartSeconds, 0, lengthSeconds),
                    EndSeconds = Math.Clamp(pair.First.NewEndSeconds, 0, lengthSeconds),
                }),
        ];

    [Pure]
    private static ChoreographyDocument? ChoreographyAfter(
        MusicBeforeReplacement before,
        SongReplacement replacement
    ) => before.Choreography is { } document ? replacement.Rewritten(document) : null;

    [Pure]
    private static SongReplacement ReplacementOf(
        NewFile newFile,
        IReadOnlyList<ChainSong> chain,
        MatchedRun matched,
        IReadOnlyList<StepBorders> steps
    )
    {
        IReadOnlyList<MusicCut> cuts = [.. chain.Select(song => song.Cut)];
        return new SongReplacement(
            newFile.MediaItemId,
            newFile.LengthSeconds,
            cuts,
            BorderMatching.Followed(
                newFile.Profile,
                cuts,
                matched.Sounds,
                matched.Found,
                [.. steps.Select(step => step.Anchors)]
            )
        );
    }

    [Pure]
    private static PlacedVideo Rewritten(PlacedVideo video, ReplacementWork work) =>
        video with
        {
            Start = work.Replacement.Rewritten(
                video.Start,
                work.HeardVideoStarts.TryGetValue(video.VideoId, out var heard) ? heard : null
            ),
        };

    [Pure]
    private static ActSong NewSongOf(ChainSong first, SongReplacement replacement)
    {
        var cut = replacement.NewCut;
        return new ActSong
        {
            ActId = first.ActId,
            MediaItemId = cut.SourceMediaItemId,
            Position = first.Snapshot.Position,
            StartSeconds = cut.StartSeconds,
            EndSeconds = cut.EndSeconds,
            FirstBeatSeconds = replacement.NewFirstBeatSeconds(first.Snapshot.FirstBeatSeconds),
            TempoBpm = replacement.NewTempoBpm(first.Snapshot.TempoBpm),
        };
    }

    [Pure]
    private static ActSong SongOf(int actId, SongSnapshot snapshot) =>
        new()
        {
            Id = snapshot.SongId,
            ActId = actId,
            MediaItemId = snapshot.MediaItemId,
            Position = snapshot.Position,
            StartSeconds = snapshot.StartSeconds,
            EndSeconds = snapshot.EndSeconds,
            FirstBeatSeconds = snapshot.FirstBeatSeconds,
            TempoBpm = snapshot.TempoBpm,
        };

    [Pure]
    private static StepBorders BordersOf(ActStep step) =>
        new(
            step.Id,
            new MusicAnchor(step.StartSourceMediaItemId, step.StartSeconds),
            new MusicAnchor(step.EndSourceMediaItemId, step.EndSeconds),
            step.StartNeedsCheck,
            step.EndNeedsCheck
        );

    [Pure]
    private static PlacedVideo PlacedVideoOf(ActVideo video) =>
        new(
            video.Id,
            new VideoAnchor(
                new MusicAnchor(
                    video.StartSourceMediaItemId.GetValueOrDefault(),
                    video.StartSeconds.GetValueOrDefault()
                ),
                video.StartVideoSeconds
            )
        );

    private static void Anchor(ActStep step, StepBorders borders)
    {
        step.StartSourceMediaItemId = borders.Start.SourceMediaItemId;
        step.StartSeconds = borders.Start.Seconds;
        step.StartNeedsCheck = borders.StartNeedsCheck;
        step.EndSourceMediaItemId = borders.End.SourceMediaItemId;
        step.EndSeconds = borders.End.Seconds;
        step.EndNeedsCheck = borders.EndNeedsCheck;
    }

    private static void Place(ActVideo video, VideoAnchor anchor)
    {
        video.StartSourceMediaItemId = anchor.Music.SourceMediaItemId;
        video.StartSeconds = anchor.Music.Seconds;
        video.StartVideoSeconds = anchor.VideoSeconds;
    }

    private sealed record NewFile(int MediaItemId, double LengthSeconds, SoundProfile Profile);

    private sealed record ChainSong(
        int ActId,
        SongSnapshot Snapshot,
        MusicCut Cut,
        Guid StorageKey
    );

    private sealed record MatchedRun(
        IReadOnlyList<ChainSong> Songs,
        IReadOnlyList<CutSound> Sounds,
        IReadOnlyList<FoundSong> Found
    );

    private sealed record ReplacementWork(
        SongReplacement Replacement,
        IReadOnlyList<StepBorders> Steps,
        IReadOnlyDictionary<int, double> HeardVideoStarts
    );
}
