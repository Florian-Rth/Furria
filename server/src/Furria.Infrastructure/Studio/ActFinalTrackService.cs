using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActFinalTrackService
{
    private const double DurationTolerance = 0.01;
    private const string UnknownAudioFileMessage = "Diese Musikdatei gehört nicht zum Auftritt.";
    private const string SongMessage =
        "Diese Datei ist ein Lied der Musik und kann keine Endfassung sein.";
    private const string FinalTrackTwiceMessage = "Diese Datei ist schon eine Endfassung.";
    private const string PendingMessage =
        "Es wartet schon eine neue Endfassung. Übernimm oder entferne sie zuerst.";
    private const string UnknownFinalTrackMessage = "Diese Endfassung gibt es im Auftritt nicht.";
    private const string AdoptedMessage = "Diese Endfassung wurde schon übernommen.";
    private const string OutdatedMessage = "Diese Endfassung ist älter als die übernommene.";
    private const string FirstBeatPastEndMessage =
        "Die erste Eins liegt hinter dem Ende der Endfassung.";
    private const string FailedMessage = "Die Endfassung ließ sich nicht vorbereiten.";
    private const string DevelopingMessage = "Die Endfassung wird noch ausgewertet.";
    private const string NoMusicMessage = "Der Auftritt hat noch keine Musik zum Abgleichen.";
    private const string MusicDevelopingMessage = "Die Musik wird noch ausgewertet.";
    private const string NoMatchMessage =
        "In der Endfassung wurde keine Musik des Auftritts gefunden. Lege sie von Hand an.";
    private const string NothingMatchedMessage =
        "In der Endfassung ist noch keine Musik des Auftritts angelegt. Lege zuerst ein Lied an.";
    private const string UnknownSourceMessage = "Diese Musik spielt im Auftritt gerade nicht.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTimelineReader _timelines;
    private readonly SoundProfiles _profiles;
    private readonly TimeProvider _timeProvider;

    public ActFinalTrackService(
        AppDbContext dbContext,
        ActStudioGate gate,
        ActTimelineReader timelines,
        SoundProfiles profiles,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _timelines = timelines;
        _profiles = profiles;
        _timeProvider = timeProvider;
    }

    public async Task<Result<int>> AddAsync(
        int accountId,
        AddActFinalTrackCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);
        if (!await IsAudioFileOfAsync(command.ActId, command.MediaItemId, ct))
            return Result<int>.NotFound(UnknownAudioFileMessage);
        if (await _dbContext.ActSongs.AnyAsync(song => song.MediaItemId == command.MediaItemId, ct))
            return Result<int>.Conflict(SongMessage);
        if (
            await _dbContext.ActFinalTracks.AnyAsync(
                track => track.MediaItemId == command.MediaItemId,
                ct
            )
        )
            return Result<int>.Conflict(FinalTrackTwiceMessage);

        var tracks = await TrackStatesOfAsync(command.ActId, ct);
        if (tracks.Any(PendingIn(tracks)))
            return Result<int>.Conflict(PendingMessage);

        var track = new ActFinalTrack
        {
            ActId = command.ActId,
            MediaItemId = command.MediaItemId,
            Version = tracks.Select(state => state.Version).DefaultIfEmpty(0).Max() + 1,
        };
        _dbContext.ActFinalTracks.Add(track);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(track.Id);
    }

    public async Task<Result> SetBeatGridAsync(
        int accountId,
        ActFinalTrackBeatCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var track = await TrackRowsOf(command.ActId, command.FinalTrackId)
            .Include(row => row.MediaItem)
            .SingleOrDefaultAsync(ct);
        if (track is null)
            return Result.NotFound(UnknownFinalTrackMessage);
        if (command.FirstBeatSeconds > track.MediaItem!.DurationSeconds + DurationTolerance)
            return Result.Validation(FirstBeatPastEndMessage);

        track.FirstBeatSeconds = command.FirstBeatSeconds;
        track.TempoBpm = command.TempoBpm;
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        ActFinalTrackCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var track = await TrackRowsOf(command.ActId, command.FinalTrackId)
            .Select(row => new { row.MediaItemId, IsAdopted = row.AdoptedAt != null })
            .SingleOrDefaultAsync(ct);
        if (track is null)
            return Result.NotFound(UnknownFinalTrackMessage);
        if (track.IsAdopted)
            return Result.Conflict(AdoptedMessage);

        await TrackRowsOf(command.ActId, command.FinalTrackId).ExecuteDeleteAsync(ct);
        await _dbContext
            .MediaItems.Where(item => item.Id == track.MediaItemId)
            .ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result<IReadOnlyList<FinalTrackMatchDetails>>> MatchAsync(
        int accountId,
        ActFinalTrackCommand command,
        CancellationToken ct
    )
    {
        var pending = await PendingTrackAsync(accountId, command.ActId, command.FinalTrackId, ct);
        if (!pending.IsSuccess)
            return Result<IReadOnlyList<FinalTrackMatchDetails>>.Carrying(pending);

        var finalProfile = await ReadyProfileOfAsync(pending.Value, ct);
        if (!finalProfile.IsSuccess)
            return Result<IReadOnlyList<FinalTrackMatchDetails>>.Carrying(finalProfile);
        var sounds = await MusicSoundsOfAsync(command.ActId, ct);
        if (!sounds.IsSuccess)
            return Result<IReadOnlyList<FinalTrackMatchDetails>>.Carrying(sounds);

        var matches = MatchesOf(sounds.Value, finalProfile.Value);
        if (matches.Count == 0)
            return Result<IReadOnlyList<FinalTrackMatchDetails>>.Validation(NoMatchMessage);

        await KeepOffsetsAsync(
            pending.Value,
            matches.ToDictionary(match => match.SourceMediaItemId, match => match.OffsetSeconds),
            ct
        );

        return Result<IReadOnlyList<FinalTrackMatchDetails>>.Success(matches);
    }

    public async Task<Result> SetOffsetAsync(
        int accountId,
        ActFinalTrackOffsetCommand command,
        CancellationToken ct
    )
    {
        var pending = await PendingTrackAsync(accountId, command.ActId, command.FinalTrackId, ct);
        if (!pending.IsSuccess)
            return Result.Carrying(pending);

        var music = await _timelines.MusicOfAsync(command.ActId, ct);
        if (music.All(source => source.SourceMediaItemId != command.SourceMediaItemId))
            return Result.NotFound(UnknownSourceMessage);

        await KeepOffsetsAsync(
            pending.Value,
            new Dictionary<int, double> { [command.SourceMediaItemId] = command.OffsetSeconds },
            ct
        );

        return Result.Success();
    }

    public async Task<Result> AdoptAsync(
        int accountId,
        ActFinalTrackCommand command,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var pending = await PendingTrackAsync(accountId, command.ActId, command.FinalTrackId, ct);
        if (!pending.IsSuccess)
            return Result.Carrying(pending);

        var track = pending.Value;
        if (ReadinessRefusalOf(track.MediaItem!) is { } refused)
            return refused;

        var adoption = await AdoptionOfAsync(track, ct);
        if (!adoption.MatchesAnyMusic)
            return Result.Validation(NothingMatchedMessage);

        await RewriteStepsAsync(command.ActId, adoption, ct);
        await RewriteVideosAsync(command.ActId, adoption, ct);
        await RewriteChoreographiesAsync(command.ActId, adoption, ct);
        track.AdoptedAt = _timeProvider.GetUtcNow();
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<FinalTrackAdoption> AdoptionOfAsync(
        ActFinalTrack track,
        CancellationToken ct
    )
    {
        var sources = (await _timelines.MusicOfAsync(track.ActId, ct))
            .Select(source => source.SourceMediaItemId)
            .ToHashSet();
        var offsets = await _dbContext
            .ActFinalTrackAlignments.Where(alignment => alignment.FinalTrackId == track.Id)
            .ToListAsync(ct);

        return new FinalTrackAdoption(
            track.MediaItemId,
            track.MediaItem!.DurationSeconds ?? 0,
            offsets
                .Where(alignment => sources.Contains(alignment.SourceMediaItemId))
                .ToDictionary(
                    alignment => alignment.SourceMediaItemId,
                    alignment => alignment.OffsetSeconds
                )
        );
    }

    private async Task RewriteStepsAsync(
        int actId,
        FinalTrackAdoption adoption,
        CancellationToken ct
    )
    {
        var steps = await _dbContext.ActSteps.Where(step => step.ActId == actId).ToListAsync(ct);
        foreach (var step in steps)
        {
            var anchor = adoption.Rewritten(
                new MusicAnchor(step.StartSourceMediaItemId, step.StartSeconds)
            );
            step.StartSourceMediaItemId = anchor.SourceMediaItemId;
            step.StartSeconds = anchor.Seconds;
        }
    }

    private async Task RewriteVideosAsync(
        int actId,
        FinalTrackAdoption adoption,
        CancellationToken ct
    )
    {
        var videos = await _dbContext
            .ActVideos.Where(video => video.ActId == actId && video.StartSourceMediaItemId != null)
            .ToListAsync(ct);
        foreach (var video in videos)
        {
            if (video is not { StartSourceMediaItemId: { } source, StartSeconds: { } seconds })
                continue;
            var anchor = adoption.Rewritten(
                new VideoAnchor(new MusicAnchor(source, seconds), video.StartVideoSeconds)
            );
            video.StartSourceMediaItemId = anchor.Music.SourceMediaItemId;
            video.StartSeconds = anchor.Music.Seconds;
            video.StartVideoSeconds = anchor.VideoSeconds;
        }
    }

    private async Task RewriteChoreographiesAsync(
        int actId,
        FinalTrackAdoption adoption,
        CancellationToken ct
    )
    {
        var choreographies = await _dbContext
            .Choreographies.Where(choreography => choreography.ActId == actId)
            .ToListAsync(ct);
        var sessionVersion = choreographies
            .SingleOrDefault(choreography => choreography.AppearanceId is null)
            ?.Version;
        foreach (var choreography in choreographies)
        {
            choreography.Document = adoption.Rewritten(choreography.Document);
            choreography.Version++;
            if (choreography.CopiedFromVersion is { } copied && copied == sessionVersion)
                choreography.CopiedFromVersion = copied + 1;
        }
    }

    private async Task<Result<ActFinalTrack>> PendingTrackAsync(
        int accountId,
        int actId,
        int finalTrackId,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, actId, ct);
        if (!editable.IsSuccess)
            return Result<ActFinalTrack>.Carrying(editable);

        var track = await TrackRowsOf(actId, finalTrackId)
            .Include(row => row.MediaItem)
            .SingleOrDefaultAsync(ct);
        if (track is null)
            return Result<ActFinalTrack>.NotFound(UnknownFinalTrackMessage);
        if (track.AdoptedAt is not null)
            return Result<ActFinalTrack>.Conflict(AdoptedMessage);

        var adoptedVersion = await _dbContext
            .ActFinalTracks.Where(row => row.ActId == actId && row.AdoptedAt != null)
            .MaxAsync(row => (int?)row.Version, ct);

        return track.Version < adoptedVersion
            ? Result<ActFinalTrack>.Conflict(OutdatedMessage)
            : Result<ActFinalTrack>.Success(track);
    }

    private async Task<Result<SoundProfile>> ReadyProfileOfAsync(
        ActFinalTrack track,
        CancellationToken ct
    )
    {
        if (ReadinessRefusalOf(track.MediaItem!) is { } refused)
            return Result<SoundProfile>.Carrying(refused);

        return await _profiles.ProfileOfAsync(track.MediaItem!.StorageKey, ct) is { } profile
            ? Result<SoundProfile>.Success(profile)
            : Result<SoundProfile>.Conflict(DevelopingMessage);
    }

    private async Task<Result<IReadOnlyList<CutSound>>> MusicSoundsOfAsync(
        int actId,
        CancellationToken ct
    )
    {
        var music = await _timelines.MusicOfAsync(actId, ct);
        if (music.Count == 0)
            return Result<IReadOnlyList<CutSound>>.Conflict(NoMusicMessage);

        return await _profiles.CutSoundsOfAsync(music, ct) is { } sounds
            ? Result<IReadOnlyList<CutSound>>.Success(sounds)
            : Result<IReadOnlyList<CutSound>>.Conflict(MusicDevelopingMessage);
    }

    private async Task KeepOffsetsAsync(
        ActFinalTrack track,
        IReadOnlyDictionary<int, double> offsetsBySource,
        CancellationToken ct
    )
    {
        var kept = await _dbContext
            .ActFinalTrackAlignments.Where(row => row.FinalTrackId == track.Id)
            .ToDictionaryAsync(row => row.SourceMediaItemId, ct);
        foreach (var (sourceMediaItemId, offsetSeconds) in offsetsBySource)
            if (kept.TryGetValue(sourceMediaItemId, out var alignment))
                alignment.OffsetSeconds = offsetSeconds;
            else
                _dbContext.ActFinalTrackAlignments.Add(
                    new ActFinalTrackAlignment
                    {
                        FinalTrackId = track.Id,
                        SourceMediaItemId = sourceMediaItemId,
                        OffsetSeconds = offsetSeconds,
                    }
                );
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<IReadOnlyList<TrackState>> TrackStatesOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        await _dbContext
            .ActFinalTracks.Where(track => track.ActId == actId)
            .Select(track => new TrackState(track.Version, track.AdoptedAt != null))
            .ToListAsync(ct);

    private IQueryable<ActFinalTrack> TrackRowsOf(int actId, int finalTrackId) =>
        _dbContext.ActFinalTracks.Where(row => row.Id == finalTrackId && row.ActId == actId);

    private Task<bool> IsAudioFileOfAsync(int actId, int mediaItemId, CancellationToken ct) =>
        _dbContext.MediaItems.AnyAsync(
            item =>
                item.Id == mediaItemId
                && item.OwnerKind == MediaOwnerKind.Act
                && item.OwnerActId == actId
                && item.Kind == MediaKind.Audio,
            ct
        );

    [Pure]
    private static Func<TrackState, bool> PendingIn(IReadOnlyList<TrackState> tracks)
    {
        var adoptedVersion = tracks
            .Where(state => state.IsAdopted)
            .Select(state => state.Version)
            .DefaultIfEmpty(0)
            .Max();

        return state => !state.IsAdopted && state.Version > adoptedVersion;
    }

    [Pure]
    private static Result? ReadinessRefusalOf(MediaItem item) =>
        item.State == MediaItemState.Failed ? Result.Conflict(FailedMessage)
        : item.State != MediaItemState.Ready || item.DurationSeconds is null
            ? Result.Conflict(DevelopingMessage)
        : null;

    [Pure]
    private static IReadOnlyList<FinalTrackMatchDetails> MatchesOf(
        IReadOnlyList<CutSound> sounds,
        SoundProfile finalProfile
    ) => [.. sounds.Select(sound => MatchOf(sound, finalProfile)).OfType<FinalTrackMatchDetails>()];

    [Pure]
    private static FinalTrackMatchDetails? MatchOf(CutSound sound, SoundProfile finalProfile) =>
        FinalTrackMatching.OffsetOf(sound, finalProfile) is { } alignment
            ? new FinalTrackMatchDetails
            {
                SourceMediaItemId = sound.Cut.SourceMediaItemId,
                OffsetSeconds = alignment.OffsetSeconds,
                Confidence = alignment.Confidence,
            }
            : null;

    private sealed record TrackState(int Version, bool IsAdopted);
}
