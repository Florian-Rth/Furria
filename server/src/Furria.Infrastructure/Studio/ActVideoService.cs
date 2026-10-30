using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.Studio;
using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Studio;

public sealed class ActVideoService
{
    private const string UnknownVideoFileMessage = "Diese Videodatei gehört nicht zum Auftritt.";
    private const string VideoTwiceMessage = "Dieses Video ist schon im Auftritt.";
    private const string FullShelfMessage = "Mehr Videos passen nicht in einen Auftritt.";
    private const string UnknownVideoMessage = "Dieses Video gibt es im Auftritt nicht.";
    private const string PastTheMusicMessage = "Das Video beginnt erst nach dem Ende der Musik.";
    private const string BeforeTheMusicMessage = "Das Video endet, bevor die Musik beginnt.";
    private const string FailedVideoMessage = "Das Video ließ sich nicht vorbereiten.";
    private const string StillDevelopingMessage = "Das Video wird noch verarbeitet.";
    private const string NoSoundtrackMessage =
        "Das Video hat keinen Ton, der sich vergleichen lässt.";
    private const string NoMusicMessage = "Der Auftritt hat noch keine Musik.";
    private const string MusicDevelopingMessage = "Die Musik wird noch ausgewertet.";
    private const string NoMatchMessage =
        "Im Ton des Videos wurde die Musik nicht gefunden. Lege es von Hand an.";

    private readonly AppDbContext _dbContext;
    private readonly ActStudioGate _gate;
    private readonly ActTimelineReader _timelines;
    private readonly SoundProfiles _profiles;

    public ActVideoService(
        AppDbContext dbContext,
        ActStudioGate gate,
        ActTimelineReader timelines,
        SoundProfiles profiles
    )
    {
        _dbContext = dbContext;
        _gate = gate;
        _timelines = timelines;
        _profiles = profiles;
    }

    public async Task<Result<int>> AddAsync(
        int accountId,
        AddActVideoCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<int>.Carrying(editable);
        if (!await IsVideoFileOfAsync(command.ActId, command.MediaItemId, ct))
            return Result<int>.NotFound(UnknownVideoFileMessage);
        if (await _dbContext.ActVideos.AnyAsync(row => row.MediaItemId == command.MediaItemId, ct))
            return Result<int>.Conflict(VideoTwiceMessage);
        if (
            await _dbContext.ActVideos.CountAsync(row => row.ActId == command.ActId, ct)
            >= ActVideo.MostPerAct
        )
            return Result<int>.Conflict(FullShelfMessage);

        var video = new ActVideo { ActId = command.ActId, MediaItemId = command.MediaItemId };
        _dbContext.ActVideos.Add(video);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(video.Id);
    }

    public async Task<Result> RenameAsync(
        int accountId,
        ActVideoNameCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        var renamed = await VideoRowsOf(command.ActId, command.VideoId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.Name, NameOf(command.Name)),
                ct
            );

        return renamed == 0 ? Result.NotFound(UnknownVideoMessage) : Result.Success();
    }

    public async Task<Result> PlaceAsync(
        int accountId,
        PlaceActVideoCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var video = await VideoRowsOf(command.ActId, command.VideoId)
            .Include(row => row.MediaItem)
            .SingleOrDefaultAsync(ct);
        if (video is null)
            return Result.NotFound(UnknownVideoMessage);

        var placed = await PlaceAtAsync(video, command.StartSeconds, ct);
        if (!placed.IsSuccess)
            return placed;
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    public async Task<Result<ActVideoAlignmentDetails>> AlignAsync(
        int accountId,
        ActVideoCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return Result<ActVideoAlignmentDetails>.Carrying(editable);

        var video = await VideoRowsOf(command.ActId, command.VideoId)
            .Include(row => row.MediaItem)
            .SingleOrDefaultAsync(ct);
        if (video is null)
            return Result<ActVideoAlignmentDetails>.NotFound(UnknownVideoMessage);

        var match = await MatchOfAsync(video, ct);
        if (!match.IsSuccess)
            return Result<ActVideoAlignmentDetails>.Carrying(match);
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var placed = await PlaceAtAsync(video, match.Value.OffsetSeconds, ct);
        if (!placed.IsSuccess)
            return Result<ActVideoAlignmentDetails>.Carrying(placed);
        await transaction.CommitAsync(ct);

        return Result<ActVideoAlignmentDetails>.Success(
            new ActVideoAlignmentDetails
            {
                StartSeconds = match.Value.OffsetSeconds,
                Confidence = match.Value.Confidence,
            }
        );
    }

    public async Task<Result> RemoveAsync(
        int accountId,
        ActVideoCommand command,
        CancellationToken ct
    )
    {
        var editable = await _gate.EditableStudioAsync(accountId, command.ActId, ct);
        if (!editable.IsSuccess)
            return editable;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var mediaItemId = await VideoRowsOf(command.ActId, command.VideoId)
            .Select(row => (int?)row.MediaItemId)
            .SingleOrDefaultAsync(ct);
        if (mediaItemId is null)
            return Result.NotFound(UnknownVideoMessage);

        await VideoRowsOf(command.ActId, command.VideoId).ExecuteDeleteAsync(ct);
        await _dbContext.MediaItems.Where(item => item.Id == mediaItemId).ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private async Task<Result> PlaceAtAsync(
        ActVideo video,
        double startSeconds,
        CancellationToken ct
    )
    {
        if (video.MediaItem!.DurationSeconds is not { } length)
            return Result.Conflict(StillDevelopingMessage);
        var timeline = await _timelines.TimelineOfAsync(video.ActId, ct);
        if (timeline.Music.LengthSeconds <= 0)
            return Result.Conflict(NoMusicMessage);
        if (startSeconds + length <= 0)
            return Result.Validation(BeforeTheMusicMessage);
        if (timeline.Music.VideoAnchorAt(startSeconds) is not { } anchor)
            return Result.Validation(PastTheMusicMessage);

        video.StartSourceMediaItemId = anchor.Music.SourceMediaItemId;
        video.StartSeconds = anchor.Music.Seconds;
        video.StartVideoSeconds = anchor.VideoSeconds;
        await _dbContext.SaveChangesAsync(ct);
        await HandPartsToAsync(video, timeline, ct);

        return Result.Success();
    }

    private async Task HandPartsToAsync(ActVideo placed, ActTimeline timeline, CancellationToken ct)
    {
        var spans = await VideoSpansOfAsync(placed.ActId, timeline.Music, ct);
        if (spans.FirstOrDefault(span => span.VideoId == placed.Id) is not { VideoId: > 0 } span)
            return;

        var outdated = VideoCoverage.OutdatedOf(spans);
        if (outdated.Contains(placed.Id))
            return;
        var ranges = PartRangesOf(timeline);
        var parts = await _dbContext
            .ActParts.Where(part => part.ActId == placed.ActId)
            .ToListAsync(ct);
        foreach (var part in parts)
            if (
                ranges.TryGetValue(part.Id, out var range)
                && (part.MainVideoId is not { } main || outdated.Contains(main))
                && VideoCoverage.CoversMostOf(span, range.Start, range.End)
            )
                part.MainVideoId = placed.Id;
        await _dbContext.SaveChangesAsync(ct);
    }

    private async Task<IReadOnlyList<VideoSpan>> VideoSpansOfAsync(
        int actId,
        ActMusic music,
        CancellationToken ct
    )
    {
        var videos = await _dbContext
            .ActVideos.Where(video => video.ActId == actId && video.StartSourceMediaItemId != null)
            .Select(video => new
            {
                video.Id,
                Source = video.StartSourceMediaItemId!.Value,
                Seconds = video.StartSeconds!.Value,
                video.StartVideoSeconds,
                video.MediaItem!.DurationSeconds,
            })
            .ToListAsync(ct);

        return
        [
            .. videos
                .Select(video =>
                    VideoCoverage.SpanOf(
                        video.Id,
                        music.LocateVideo(
                            new VideoAnchor(
                                new MusicAnchor(video.Source, video.Seconds),
                                video.StartVideoSeconds
                            )
                        ),
                        video.DurationSeconds
                    )
                )
                .OfType<VideoSpan>(),
        ];
    }

    private async Task<Result<SoundAlignment>> MatchOfAsync(ActVideo video, CancellationToken ct)
    {
        if (video.MediaItem!.State == MediaItemState.Failed)
            return Result<SoundAlignment>.Conflict(FailedVideoMessage);
        if (video.MediaItem.State != MediaItemState.Ready)
            return Result<SoundAlignment>.Conflict(StillDevelopingMessage);
        if (await _profiles.ProfileOfAsync(video.MediaItem.StorageKey, ct) is not { } soundtrack)
            return Result<SoundAlignment>.Conflict(NoSoundtrackMessage);

        var music = await _timelines.MusicOfAsync(video.ActId, ct);
        if (music.Count == 0)
            return Result<SoundAlignment>.Conflict(NoMusicMessage);
        if (await _profiles.CutSoundsOfAsync(music, ct) is not { } sounds)
            return Result<SoundAlignment>.Conflict(MusicDevelopingMessage);

        return VideoMatching.StartOf(sounds, soundtrack) is { } alignment
            ? Result<SoundAlignment>.Success(alignment)
            : Result<SoundAlignment>.Validation(NoMatchMessage);
    }

    private IQueryable<ActVideo> VideoRowsOf(int actId, int videoId) =>
        _dbContext.ActVideos.Where(row => row.Id == videoId && row.ActId == actId);

    private Task<bool> IsVideoFileOfAsync(int actId, int mediaItemId, CancellationToken ct) =>
        _dbContext.MediaItems.AnyAsync(
            item =>
                item.Id == mediaItemId
                && item.OwnerKind == MediaOwnerKind.Act
                && item.OwnerActId == actId
                && item.Kind == MediaKind.Video,
            ct
        );

    [Pure]
    private static Dictionary<int, (double Start, double End)> PartRangesOf(ActTimeline timeline)
    {
        var steps = timeline.Steps.Spans.ToDictionary(step => step.StepId);
        return timeline
            .Parts.Spans.Where(part => part.StepIds.Count > 0)
            .ToDictionary(
                part => part.PartId,
                part => (steps[part.StepIds[0]].StartSeconds, steps[part.StepIds[^1]].EndSeconds)
            );
    }

    [Pure]
    private static string? NameOf(string? name) =>
        string.IsNullOrWhiteSpace(name) ? null : name.Trim();
}
