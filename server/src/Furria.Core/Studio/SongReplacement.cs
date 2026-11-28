using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed class SongReplacement
{
    private const double EdgeToleranceSeconds = 0.05;

    private readonly int _newMediaItemId;
    private readonly double _newLengthSeconds;
    private readonly ActMusic _chain;
    private readonly IReadOnlyList<MusicCut> _chainCuts;
    private readonly IReadOnlyList<FoundSong> _replaced;
    private readonly Dictionary<MusicCut, SongPlacement> _placementsByCut;

    private SongPlacement? OnlyPlacement => _replaced.Count == 1 ? _replaced[0].Placement : null;

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
        IReadOnlyList<FoundSong> replaced
    )
    {
        _newMediaItemId = newMediaItemId;
        _newLengthSeconds = newLengthSeconds;
        _chain = new ActMusic(chain);
        _chainCuts = chain;
        _replaced = replaced;
        _placementsByCut = replaced.ToDictionary(song => song.Cut, song => song.Placement);
    }

    [Pure]
    public double? NewFirstBeatSeconds(double? firstBeatSeconds) =>
        OnlyPlacement is { } placement
        && firstBeatSeconds is { } beat
        && placement.NewSecondsOf(beat) is var seconds and >= 0
        && seconds <= _newLengthSeconds
            ? seconds
            : null;

    [Pure]
    public double? NewTempoBpm(double? tempoBpm) =>
        OnlyPlacement is { } placement && tempoBpm is { } tempo ? tempo / placement.Stretch : null;

    [Pure]
    public MusicAnchor Rewritten(MusicAnchor anchor) =>
        NewSecondsOf(anchor) is { } seconds && IsInTheNewFile(seconds)
            ? OnTheNewFile(seconds)
            : anchor;

    [Pure]
    public VideoAnchor Rewritten(VideoAnchor anchor)
    {
        if (NewSecondsOf(anchor.Music) is not { } seconds || IsPastTheNewFile(seconds))
            return anchor;

        var videoStart = seconds - anchor.VideoSeconds;
        return videoStart >= 0
            ? new VideoAnchor(new MusicAnchor(_newMediaItemId, videoStart), 0)
            : new VideoAnchor(new MusicAnchor(_newMediaItemId, 0), -videoStart);
    }

    [Pure]
    public IReadOnlyList<StepAnchors> RewrittenSteps(IEnumerable<StepAnchors> steps) =>
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
    private IReadOnlyList<StepAnchors> WithoutOverlapsOnTheNewFile(IReadOnlyList<StepAnchors> steps)
    {
        var onTheNewFile = steps.Where(IsOnTheNewFile).OrderBy(step => step.Start.Seconds).ToList();
        var trimmedEnds = onTheNewFile
            .Zip(onTheNewFile.Skip(1))
            .Where(pair => pair.First.End.Seconds > pair.Second.Start.Seconds)
            .ToDictionary(pair => pair.First.StepId, pair => pair.Second.Start);

        return
        [
            .. steps.Select(step =>
                trimmedEnds.TryGetValue(step.StepId, out var end) ? step with { End = end } : step
            ),
        ];
    }

    [Pure]
    private bool IsOnTheNewFile(StepAnchors step) =>
        step.Start.SourceMediaItemId == _newMediaItemId
        && step.End.SourceMediaItemId == _newMediaItemId;

    [Pure]
    private StepAnchors Rewritten(StepAnchors step)
    {
        var start = NewSecondsOf(step.Start);
        var end = NewEndSecondsOf(step.End);
        if (start is { } from && end is { } to && IsWhollyOutsideTheNewFile(from, to))
            return step;

        return step with
        {
            Start = start is { } newStart ? OnTheNewFile(newStart) : step.Start,
            End = end is { } newEnd ? OnTheNewFile(newEnd) : step.End,
        };
    }

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
        PlacementOf(_chain.PieceHolding(anchor) ?? NearestCutOf(anchor))
            ?.NewSecondsOf(anchor.Seconds);

    [Pure]
    private double? NewEndSecondsOf(MusicAnchor anchor) =>
        PlacementOf(_chain.PieceEnding(anchor) ?? NearestCutOf(anchor))
            ?.NewSecondsOf(anchor.Seconds);

    [Pure]
    private SongPlacement? PlacementOf(MusicCut? cut) =>
        cut is { } song && _placementsByCut.TryGetValue(song, out var placement) ? placement : null;

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
