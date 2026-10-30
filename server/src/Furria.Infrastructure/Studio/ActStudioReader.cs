using System.Diagnostics.Contracts;
using Furria.Application.RunningOrders;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Studio;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.RunningOrders;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActStudioReader
{
    private readonly AppDbContext _dbContext;
    private readonly ActCatalogue _catalogue;
    private readonly MediaUrlSigner _signer;
    private readonly ClubRecordService _clubRecords;

    public ActStudioReader(
        AppDbContext dbContext,
        ActCatalogue catalogue,
        MediaUrlSigner signer,
        ClubRecordService clubRecords
    )
    {
        _dbContext = dbContext;
        _catalogue = catalogue;
        _signer = signer;
        _clubRecords = clubRecords;
    }

    public async Task<ActStudioContent> ContentOfAsync(int actId, CancellationToken ct)
    {
        var owner = MediaOwner.Act(actId);
        var songs = await SongsOfAsync(actId, owner, ct);
        var finalTracks = await FinalTracksOfAsync(actId, owner, ct);
        var adopted = finalTracks.FirstOrDefault(track => track.IsAdopted);
        var music = new ActMusic(adopted is null ? songs.Select(CutOf) : [CutOf(adopted)]);
        var steps = await _dbContext
            .ActSteps.AsNoTracking()
            .Where(step => step.ActId == actId)
            .ToDictionaryAsync(step => step.Id, ct);
        var stepTiling = ActSteps.Tile(
            steps.Values.Select(step => new StepStart(step.Id, AnchorOf(step))),
            music
        );

        return new ActStudioContent
        {
            Music = new StudioMusicDetails
            {
                LengthSeconds = music.LengthSeconds,
                Source = adopted is null
                    ? StudioMusicSource.WorkingMix
                    : StudioMusicSource.FinalTrack,
            },
            Songs = songs,
            FinalTracks = finalTracks,
            Steps = StepsOf(steps, music, stepTiling),
            Parts = await PartsOfAsync(actId, stepTiling, ct),
            Spots = await SpotsOfAsync(actId, ct),
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
                EndSeconds = row.EndSeconds ?? row.DurationSeconds ?? row.StartSeconds,
                FirstBeatSeconds = row.FirstBeatSeconds ?? row.AnalysedFirstBeat,
                TempoBpm = row.TempoBpm ?? row.AnalysedTempo,
                State = row.State,
                DurationSeconds = row.DurationSeconds,
                FileName = row.OriginalFileName,
                Urls = AudioUrlsOf(row.MediaItemId, owner),
            }),
        ];
    }

    private async Task<IReadOnlyList<StudioFinalTrackDetails>> FinalTracksOfAsync(
        int actId,
        MediaOwner owner,
        CancellationToken ct
    )
    {
        var rows = await _dbContext
            .ActFinalTracks.AsNoTracking()
            .Where(track => track.ActId == actId)
            .OrderByDescending(track => track.Version)
            .Select(track => new
            {
                track.Id,
                track.MediaItemId,
                track.Version,
                track.AdoptedAt,
                track.MediaItem!.State,
                track.MediaItem.DurationSeconds,
            })
            .ToListAsync(ct);
        var adoptedId = rows.Where(row => row.AdoptedAt is not null)
            .MaxBy(row => row.AdoptedAt)
            ?.Id;

        return
        [
            .. rows.Select(row => new StudioFinalTrackDetails
            {
                FinalTrackId = row.Id,
                MediaItemId = row.MediaItemId,
                Version = row.Version,
                IsAdopted = row.Id == adoptedId,
                State = row.State,
                DurationSeconds = row.DurationSeconds,
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
                    span.StartSeconds,
                    span.EndSeconds,
                    AnchorPlacement.OnTimeline
                )
            ),
            .. tiling
                .AdriftStepIds.Select(stepId => steps[stepId])
                .OrderBy(step => step.Id)
                .Select(step => StepOf(step, null, null, music.Locate(AnchorOf(step)).Placement)),
        ];

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
        var tiling = ActParts.Tile(
            steps,
            parts.Values.Select(part => new PartStart(part.Id, part.FirstStepId))
        );

        return
        [
            .. tiling.Spans.Select(span => PartOf(parts[span.PartId], span.StepIds, false)),
            .. tiling.AdriftPartIds.Order().Select(partId => PartOf(parts[partId], [], true)),
        ];
    }

    private async Task<IReadOnlyList<StudioSpotDetails>> SpotsOfAsync(
        int actId,
        CancellationToken ct
    )
    {
        var spots = await _dbContext
            .Spots.AsNoTracking()
            .Where(spot => spot.ActId == actId)
            .OrderBy(spot => spot.Number)
            .Select(spot => new
            {
                spot.Id,
                spot.Number,
                spot.PersonId,
            })
            .ToListAsync(ct);
        var persons = await _catalogue.PersonsInNameOrderAsync(
            [.. spots.Select(spot => spot.PersonId).OfType<int>()],
            ct
        );
        var personOf = persons.ToDictionary(person => person.PersonId);

        return
        [
            .. spots.Select(spot => new StudioSpotDetails
            {
                SpotId = spot.Id,
                Number = spot.Number,
                Person = spot.PersonId is { } personId
                    ? personOf.GetValueOrDefault(personId)
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
                    VideoCoverage.SpanOf(row.VideoId, places[row.VideoId], row.DurationSeconds)
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
            Placement = VideoPlacementOf(place),
            IsOutdated = isOutdated,
            Urls = new StudioVideoUrls
            {
                Video = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Video),
                Compact = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Compact),
                Poster = _signer.UrlOf(row.MediaItemId, owner, MediaRendition.Poster),
            },
        };
    }

    private async Task<StudioChoreographyDetails?> ChoreographyOfAsync(
        int actId,
        CancellationToken ct
    ) =>
        await _dbContext
            .Choreographies.AsNoTracking()
            .Where(choreography => choreography.ActId == actId && choreography.AppearanceId == null)
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
    private static MusicCut CutOf(StudioFinalTrackDetails track) =>
        new(track.MediaItemId, 0, track.DurationSeconds ?? 0);

    [Pure]
    private static MusicAnchor AnchorOf(ActStep step) =>
        new(step.StartSourceMediaItemId, step.StartSeconds);

    [Pure]
    private static StudioStepDetails StepOf(
        ActStep step,
        double? startSeconds,
        double? endSeconds,
        AnchorPlacement placement
    ) =>
        new()
        {
            StepId = step.Id,
            Name = step.Name,
            Description = step.Description,
            StartSeconds = startSeconds,
            EndSeconds = endSeconds,
            Placement = placement,
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
        MediaItemState State,
        double? DurationSeconds
    )
    {
        public VideoAnchor? StartAnchor =>
            StartSourceMediaItemId is { } source && StartSeconds is { } seconds
                ? new VideoAnchor(new MusicAnchor(source, seconds), StartVideoSeconds)
                : null;
    }
}
