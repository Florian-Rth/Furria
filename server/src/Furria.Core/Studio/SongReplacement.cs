using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed class SongReplacement
{
    private const double EdgeToleranceSeconds = 0.05;

    private readonly int _newMediaItemId;
    private readonly double _newLengthSeconds;
    private readonly ActMusic _chain;
    private readonly IReadOnlyList<MusicCut> _chainCuts;
    private readonly IReadOnlyList<FollowedSong> _replaced;
    private readonly Dictionary<MusicCut, SongWarp> _warpsByCut;

    private SongWarp? OnlyWarp => _replaced.Count == 1 ? _replaced[0].Warp : null;

    public MusicCut NewCut =>
        new(
            _newMediaItemId,
            Math.Max(0, _replaced[0].NewStartSeconds),
            Math.Min(_newLengthSeconds, _replaced[^1].NewEndSeconds)
        );

    public SongReplacement(
        int newMediaItemId,
        double newLengthSeconds,
        IReadOnlyList<MusicCut> chain,
        IReadOnlyList<FollowedSong> replaced
    )
    {
        _newMediaItemId = newMediaItemId;
        _newLengthSeconds = newLengthSeconds;
        _chain = new ActMusic(chain);
        _chainCuts = chain;
        _replaced = replaced;
        _warpsByCut = replaced.ToDictionary(song => song.Cut, song => song.Warp);
    }

    [Pure]
    public double? NewFirstBeatSeconds(double? firstBeatSeconds) =>
        OnlyWarp is { } warp
        && firstBeatSeconds is { } beat
        && warp.NewSecondsOf(beat) is var seconds and >= 0
        && seconds <= _newLengthSeconds
            ? seconds
            : null;

    [Pure]
    public double? NewTempoBpm(double? tempoBpm) =>
        OnlyWarp is { } warp && tempoBpm is { } tempo ? tempo / warp.Stretch : null;

    [Pure]
    public MusicAnchor Rewritten(MusicAnchor anchor) =>
        NewSecondsOf(anchor) is { } seconds && IsInTheNewFile(seconds)
            ? OnTheNewFile(seconds)
            : anchor;

    [Pure]
    public VideoAnchor Rewritten(VideoAnchor anchor, double? heardStartSeconds)
    {
        if (NewSecondsOf(anchor.Music) is not { } seconds)
            return anchor;

        if (heardStartSeconds is null && IsPastTheNewFile(seconds))
            return anchor;

        var videoStart = heardStartSeconds ?? seconds - anchor.VideoSeconds;

        return videoStart >= 0
            ? new VideoAnchor(new MusicAnchor(_newMediaItemId, videoStart), 0)
            : new VideoAnchor(new MusicAnchor(_newMediaItemId, 0), -videoStart);
    }

    [Pure]
    public IReadOnlyList<StepBorders> RewrittenSteps(IEnumerable<StepBorders> steps) =>
        WithoutOverlapsOnTheNewFile([.. steps.Select(Rewritten)]);

    [Pure]
    public ChoreographyDocument Rewritten(ChoreographyDocument document) =>
        new([
            .. document.Tracks.Select(track =>
                track with
                {
                    Keyframes =
                    [
                        .. track.Keyframes.Select(keyframe =>
                            keyframe with
                            {
                                At = Rewritten(keyframe.At),
                            }
                        ),
                    ],
                }
            ),
        ]);

    [Pure]
    private IReadOnlyList<StepBorders> WithoutOverlapsOnTheNewFile(IReadOnlyList<StepBorders> steps)
    {
        var onTheNewFile = steps.Where(IsOnTheNewFile).OrderBy(step => step.Start.Seconds).ToList();
        var nextOverlapping = onTheNewFile
            .Zip(onTheNewFile.Skip(1))
            .Where(pair => pair.First.End.Seconds > pair.Second.Start.Seconds)
            .ToDictionary(pair => pair.First.StepId, pair => pair.Second);

        return
        [
            .. steps.Select(step =>
                nextOverlapping.TryGetValue(step.StepId, out var next)
                    ? step with
                    {
                        End = next.Start,
                        EndNeedsCheck = next.StartNeedsCheck,
                    }
                    : step
            ),
        ];
    }

    [Pure]
    private bool IsOnTheNewFile(StepBorders step) =>
        step.Start.SourceMediaItemId == _newMediaItemId
        && step.End.SourceMediaItemId == _newMediaItemId;

    [Pure]
    private StepBorders Rewritten(StepBorders step)
    {
        var start = NewSecondsOf(step.Start);
        var end = NewEndSecondsOf(step.End);
        if (start is { } from && end is { } to && IsWhollyOutsideTheNewFile(from, to))
            return step;

        return step with
        {
            Start = start is { } newStart ? OnTheNewFile(newStart) : step.Start,
            StartNeedsCheck =
                step.StartNeedsCheck || (start is not null && !IsFoundStart(step.Start)),
            End = end is { } newEnd ? OnTheNewFile(newEnd) : step.End,
            EndNeedsCheck = step.EndNeedsCheck || (end is not null && !IsFoundEnd(step.End)),
        };
    }

    [Pure]
    private bool IsFoundStart(MusicAnchor anchor) =>
        WarpOf(_chain.PieceHolding(anchor))?.Found(anchor.Seconds) ?? false;

    [Pure]
    private bool IsFoundEnd(MusicAnchor anchor) =>
        WarpOf(_chain.PieceEnding(anchor))?.Found(anchor.Seconds) ?? false;

    [Pure]
    private bool IsWhollyOutsideTheNewFile(double startSeconds, double endSeconds) =>
        endSeconds <= EdgeToleranceSeconds
        || startSeconds >= _newLengthSeconds - EdgeToleranceSeconds;

    [Pure]
    private bool IsInTheNewFile(double seconds) =>
        seconds >= -EdgeToleranceSeconds && !IsPastTheNewFile(seconds);

    [Pure]
    private bool IsPastTheNewFile(double seconds) =>
        seconds > _newLengthSeconds + EdgeToleranceSeconds;

    [Pure]
    private MusicAnchor OnTheNewFile(double seconds) =>
        new(_newMediaItemId, Math.Clamp(seconds, 0, _newLengthSeconds));

    [Pure]
    private double? NewSecondsOf(MusicAnchor anchor) =>
        WarpOf(_chain.PieceHolding(anchor) ?? NearestCutOf(anchor))?.NewSecondsOf(anchor.Seconds);

    [Pure]
    private double? NewEndSecondsOf(MusicAnchor anchor) =>
        WarpOf(_chain.PieceEnding(anchor) ?? NearestCutOf(anchor))?.NewSecondsOf(anchor.Seconds);

    [Pure]
    private SongWarp? WarpOf(MusicCut? cut) =>
        cut is { } song && _warpsByCut.TryGetValue(song, out var warp) ? warp : null;

    [Pure]
    private MusicCut? NearestCutOf(MusicAnchor anchor)
    {
        var ofFile = _chainCuts
            .Where(cut => cut.SourceMediaItemId == anchor.SourceMediaItemId)
            .OrderBy(cut => cut.StartSeconds)
            .ToList();
        if (ofFile.Count == 0)
            return null;

        var startedBefore = ofFile.Where(cut => cut.StartSeconds <= anchor.Seconds).ToList();
        return startedBefore.Count > 0 ? startedBefore[^1] : ofFile[0];
    }
}
