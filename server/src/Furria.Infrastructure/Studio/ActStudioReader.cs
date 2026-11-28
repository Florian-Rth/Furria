using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Studio;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActStudioReader
{
    private readonly AppDbContext _dbContext;
    private readonly MediaUrlSigner _signer;
    private readonly ClubRecordService _clubRecords;

    public ActStudioReader(
        AppDbContext dbContext,
        MediaUrlSigner signer,
        ClubRecordService clubRecords
    )
    {
        _dbContext = dbContext;
        _signer = signer;
        _clubRecords = clubRecords;
    }

    public async Task<ActStudioContent> ContentOfAsync(ActSummary act, CancellationToken ct)
    {
        var actId = act.ActId;
        var owner = MediaOwner.Act(actId);
        var songs = await SongsOfAsync(actId, owner, ct);
        var music = new ActMusic(songs.Select(CutOf));
        var steps = await _dbContext
            .ActSteps.AsNoTracking()
            .Where(step => step.ActId == actId)
            .ToDictionaryAsync(step => step.Id, ct);
        var stepTiling = ActSteps.Tile(steps.Values.Select(AnchorsOf), music);

        return new ActStudioContent
        {
            Music = new StudioMusicDetails { LengthSeconds = music.LengthSeconds },
            Songs = songs,
            Steps = StepsOf(steps, music, stepTiling),
            Parts = await PartsOfAsync(actId, stepTiling, ct),
            Spots = await SpotsOfAsync(act, ct),
            Videos = await VideosOfAsync(actId, owner, music, ct),
            Choreography = await ChoreographyOfAsync(actId, ct),
            Stage = await _clubRecords.StageOfClubAsync(ct),
        };
    }

    private async Task<IReadOnlyList<StudioSongDetails>> SongsOfAsync(
        int actId,
        MediaOwner owner,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .ActSongs.AsNoTracking()
            .Where(song => song.ActId == actId)
            .OrderBy(song => song.Position)
            .ThenBy(song => song.Id)
            .Select(song => new
            {
                song.Id,
                song.MediaItemId,
                song.Position,
                song.StartSeconds,
                song.EndSeconds,
                song.FirstBeatSeconds,
                song.TempoBpm,
                song.MediaItem!.State,
                song.MediaItem.DurationSeconds,
                song.MediaItem.OriginalFileName,
                AnalysedFirstBeat = song.MediaItem.Audio == null
                    ? null
                    : song.MediaItem.Audio.FirstBeatSeconds,
                AnalysedTempo = song.MediaItem.Audio == null ? null : song.MediaItem.Audio.TempoBpm,
            })
            .ToListAsync(ct);

        return
        [
            .. rows.Select(row => new StudioSongDetails
            {
                SongId = row.Id,
                MediaItemId = row.MediaItemId,
                Position = row.Position,
                StartSeconds = row.StartSeconds,
                EndSeconds = MusicCut
                    .OfSong(row.MediaItemId, row.StartSeconds, row.EndSeconds, row.DurationSeconds)
                    .EndSeconds,
                FirstBeatSeconds = row.FirstBeatSeconds ?? row.AnalysedFirstBeat,
                TempoBpm = row.TempoBpm ?? row.AnalysedTempo,
                State = row.State,
                DurationSeconds = row.DurationSeconds,
                FileName = row.OriginalFileName,
                Urls = AudioUrlsOf(row.MediaItemId, owner),
            }),
        ];
    }

    [Pure]
    private static IReadOnlyList<StudioStepDetails> StepsOf(
        IReadOnlyDictionary<int, ActStep> steps,
        ActMusic music,
        StepTiling tiling
    ) =>
        [
            .. tiling.Spans.Select(span =>
                StepOf(
                    steps[span.StepId],
                    AnchorPlace.At(span.StartSeconds),
                    AnchorPlace.At(span.EndSeconds)
                )
            ),
            .. tiling
                .AdriftStepIds.Select(stepId => steps[stepId])
                .OrderBy(step => step.Id)
                .Select(step => AdriftStepOf(step, music)),
        ];

    [Pure]
    private static StudioStepDetails AdriftStepOf(ActStep step, ActMusic music)
    {
        var anchors = AnchorsOf(step);
        var details = StepOf(step, music.Locate(anchors.Start), music.LocateEnd(anchors.End));

        return details with
        {
            StartSeconds = null,
            EndSeconds = null,
        };
    }

    private async Task<IReadOnlyList<StudioPartDetails>> PartsOfAsync(
        int actId,
        StepTiling steps,
        CancellationToken ct
    )
    {
        var parts = await _dbContext
            .ActParts.AsNoTracking()
            .Where(part => part.ActId == actId)
            .ToDictionaryAsync(part => part.Id, ct);
        var tiling = ActParts.Group(
            steps,
            parts.Values.Select(part => new PartRange(part.Id, part.FirstStepId, part.LastStepId))
        );

        return
        [
            .. tiling.Spans.Select(span => PartOf(parts[span.PartId], span.StepIds, false)),
            .. tiling.AdriftPartIds.Order().Select(partId => PartOf(parts[partId], [], true)),
        ];
    }

    private async Task<IReadOnlyList<StudioSpotDetails>> SpotsOfAsync(
        ActSummary act,
        CancellationToken ct
    )
    {
        var spots = await _dbContext
            .Spots.AsNoTracking()
            .Where(spot => spot.ActId == act.ActId)
            .OrderBy(spot => spot.Number)
            .Select(spot => new
            {
                spot.Id,
                spot.Number,
                spot.PersonId,
            })
            .ToListAsync(ct);
        var castMemberOf = act.Cast.ToDictionary(member => member.PersonId);

        return
        [
            .. spots.Select(spot => new StudioSpotDetails
            {
                SpotId = spot.Id,
                Number = spot.Number,
                Person = spot.PersonId is { } personId
                    ? castMemberOf.GetValueOrDefault(personId)
                    : null,
            }),
        ];
    }

    private async Task<IReadOnlyList<StudioVideoDetails>> VideosOfAsync(
        int actId,
        MediaOwner owner,
        ActMusic music,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .ActVideos.AsNoTracking()
            .Where(video => video.ActId == actId)
            .OrderBy(video => video.Id)
            .Select(video => new VideoRow(
                video.Id,
                video.MediaItemId,
                video.Name,
                video.StartSourceMediaItemId,
                video.StartSeconds,
                video.StartVideoSeconds,
                video.ClipStartSeconds,
                video.ClipEndSeconds,
                video.MediaItem!.State,
                video.MediaItem.DurationSeconds
            ))
            .ToListAsync(ct);

        var places = rows.ToDictionary(
            row => row.VideoId,
            row => row.StartAnchor is { } anchor ? music.LocateVideo(anchor) : (AnchorPlace?)null
        );
        var outdated = VideoCoverage.OutdatedOf([
            .. rows.Select(row =>
                    VideoCoverage.SpanOf(
                        row.VideoId,
                        places[row.VideoId],
                        row.ClipStartSeconds,
                        row.ClipEndSeconds
                    )
                )
                .OfType<VideoSpan>(),
        ]);

        return
        [
            .. rows.Select(row =>
                VideoOf(row, places[row.VideoId], outdated.Contains(row.VideoId), owner)
            ),
        ];
    }

    private StudioVideoDetails VideoOf(
        VideoRow row,
        AnchorPlace? place,
        bool isOutdated,
        MediaOwner owner
    )
    {
        return new StudioVideoDetails
        {
            VideoId = row.VideoId,
            MediaItemId = row.MediaItemId,
            Name = row.Name,
            State = row.State,
            DurationSeconds = row.DurationSeconds,
            StartSeconds = place?.TimelineSeconds,
            ClipStartSeconds = row.ClipStartSeconds,
            ClipEndSeconds = row.ClipEndSeconds,
            Placement = VideoPlacementOf(place),
            IsOutdated = isOutdated,
            Urls = new StudioVideoUrls
            {
                Video = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Video),
                Compact = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Compact),
                Poster = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Poster),
                Peaks = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Peaks),
            },
        };
    }

    private async Task<StudioChoreographyDetails?> ChoreographyOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        await _dbContext
            .Choreographies.AsNoTracking()
            .Where(choreography => choreography.ActId == actId)
            .Select(choreography => new StudioChoreographyDetails
            {
                Version = choreography.Version,
                Document = choreography.Document,
            })
            .SingleOrDefaultAsync(ct);

    private StudioAudioUrls AudioUrlsOf(int mediaItemId, MediaOwner owner) =>
        new()
        {
            Normalised = _signer.UrlOf(mediaItemId, owner, MediaRendition.Normalised),
            Preview = _signer.UrlOf(mediaItemId, owner, MediaRendition.Preview),
            Peaks = _signer.UrlOf(mediaItemId, owner, MediaRendition.Peaks),
        };

    [Pure]
    private static MusicCut CutOf(StudioSongDetails song) =>
        new(song.MediaItemId, song.StartSeconds, song.EndSeconds);

    [Pure]
    private static StepAnchors AnchorsOf(ActStep step) =>
        new(
            step.Id,
            new MusicAnchor(step.StartSourceMediaItemId, step.StartSeconds),
            new MusicAnchor(step.EndSourceMediaItemId, step.EndSeconds)
        );

    [Pure]
    private static StudioStepDetails StepOf(ActStep step, AnchorPlace start, AnchorPlace end) =>
        new()
        {
            StepId = step.Id,
            Name = step.Name,
            StartSeconds = start.TimelineSeconds,
            EndSeconds = end.TimelineSeconds,
            Placement = start.Placement,
            EndPlacement = end.Placement,
        };

    [Pure]
    private static StudioPartDetails PartOf(
        ActPart part,
        IReadOnlyList<int> stepIds,
        bool adrift
    ) =>
        new()
        {
            PartId = part.Id,
            Name = part.Name,
            FirstStepId = part.FirstStepId,
            LastStepId = part.LastStepId,
            StepIds = stepIds,
            MainVideoId = part.MainVideoId,
            IsAdrift = adrift,
        };

    [Pure]
    private static VideoPlacement VideoPlacementOf(AnchorPlace? place) =>
        place?.Placement switch
        {
            AnchorPlacement.OnTimeline => VideoPlacement.OnTimeline,
            AnchorPlacement.CutAway => VideoPlacement.CutAway,
            AnchorPlacement.MusicMissing => VideoPlacement.MusicMissing,
            _ => VideoPlacement.Unaligned,
        };

    private sealed record VideoRow(
        int VideoId,
        int MediaItemId,
        string? Name,
        int? StartSourceMediaItemId,
        double? StartSeconds,
        double StartVideoSeconds,
        double ClipStartSeconds,
        double? StoredClipEndSeconds,
        MediaItemState State,
        double? DurationSeconds
    )
    {
        public double? ClipEndSeconds => StoredClipEndSeconds ?? DurationSeconds;

        public VideoAnchor? StartAnchor =>
            StartSourceMediaItemId is { } source && StartSeconds is { } seconds
                ? new VideoAnchor(new MusicAnchor(source, seconds), StartVideoSeconds)
                : null;
    }
}
