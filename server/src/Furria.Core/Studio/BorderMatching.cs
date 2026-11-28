using System.Collections.Immutable;
using System.Diagnostics.Contracts;
using Furria.Core.Sound;

namespace Furria.Core.Studio;

public static class BorderMatching
{
    private const double SureConfidence = 0.8;
    private const double LeastDistinctness = 0.2;
    private const double WindowReachSeconds = 4;
    private const double NearReachSeconds = 0.25;
    private const double WideReachSeconds = 30;
    private const double ShortestStepSeconds = 0.1;

    [Pure]
    public static IReadOnlyList<FollowedSong> Followed(
        SoundProfile newFile,
        IReadOnlyList<MusicCut> chain,
        IReadOnlyList<CutSound> songs,
        IReadOnlyList<FoundSong> found,
        IReadOnlyList<StepAnchors> steps
    )
    {
        var music = new ActMusic(chain);
        return
        [
            .. songs
                .Zip(found)
                .Select(pair => new FollowedSong(
                    pair.First.Cut,
                    WarpOf(
                        newFile,
                        pair.First,
                        pair.Second.Placement,
                        BordersOf(pair.First.Cut, music, steps)
                    )
                )),
        ];
    }

    [Pure]
    public static SongWarp WarpOf(
        SoundProfile newFile,
        CutSound song,
        SongPlacement placement,
        IEnumerable<double> borders
    ) =>
        new(
            placement,
            borders
                .Where(border => Holds(song.Cut, border))
                .Distinct()
                .Order()
                .Aggregate(
                    ImmutableList<WarpPoint>.Empty,
                    (points, border) =>
                        FoundAt(newFile, WindowAround(song, placement, border), LastOf(points))
                            is { } newSeconds
                            ? points.Add(new WarpPoint(border, newSeconds))
                            : points
                )
        );

    [Pure]
    private static double? FoundAt(SoundProfile newFile, BorderWindow window, WarpPoint? last)
    {
        var predicted = last is { } point
            ? point.NewSeconds + (window.Border - point.OldSeconds) * window.Stretch
            : window.Placement.NewSecondsOf(window.Border);
        var found =
            Sure(AlignedNear(newFile, window, predicted, NearReachSeconds))
            ?? SureAndDistinct(AlignedNear(newFile, window, predicted, WideReachSeconds));

        return found is { } newSeconds && KeepsOrder(last, newSeconds) ? newSeconds : null;
    }

    [Pure]
    private static BorderWindow WindowAround(CutSound song, SongPlacement placement, double border)
    {
        var start = Math.Max(song.Cut.StartSeconds, border - WindowReachSeconds);
        var end = Math.Min(song.Cut.EndSeconds, border + WindowReachSeconds);

        return new BorderWindow(
            song.Profile.Excerpt(start, end).Stretched(placement.Stretch),
            border,
            (border - start) * placement.Stretch,
            placement
        );
    }

    [Pure]
    private static WindowAlignment? AlignedNear(
        SoundProfile newFile,
        BorderWindow window,
        double predictedSeconds,
        double reachSeconds
    )
    {
        var windowStart = predictedSeconds - window.LeadSeconds;
        var found = WindowSearch.AlignWithin(
            newFile,
            window.Sound,
            windowStart - reachSeconds,
            windowStart + reachSeconds
        );
        return found is null
            ? null
            : found with
            {
                OffsetSeconds = found.OffsetSeconds + window.LeadSeconds,
            };
    }

    [Pure]
    private static WarpPoint? LastOf(ImmutableList<WarpPoint> points) =>
        points.IsEmpty ? null : points[^1];

    [Pure]
    private static bool KeepsOrder(WarpPoint? last, double newSeconds) =>
        last is not { } point || newSeconds >= point.NewSeconds + ShortestStepSeconds;

    [Pure]
    private static IEnumerable<double> BordersOf(
        MusicCut cut,
        ActMusic music,
        IReadOnlyList<StepAnchors> steps
    ) =>
        [
            cut.StartSeconds,
            cut.EndSeconds,
            .. steps
                .Where(step => music.PieceHolding(step.Start) == cut)
                .Select(step => step.Start.Seconds),
            .. steps
                .Where(step => music.PieceEnding(step.End) == cut)
                .Select(step => step.End.Seconds),
        ];

    [Pure]
    private static double? Sure(WindowAlignment? alignment) =>
        alignment is { Confidence: >= SureConfidence } ? alignment.OffsetSeconds : null;

    [Pure]
    private static double? SureAndDistinct(WindowAlignment? alignment) =>
        alignment is { Distinctness: >= LeastDistinctness } ? Sure(alignment) : null;

    [Pure]
    private static bool Holds(MusicCut cut, double seconds) =>
        seconds >= cut.StartSeconds && seconds <= cut.EndSeconds;

    private sealed record BorderWindow(
        SoundProfile Sound,
        double Border,
        double LeadSeconds,
        SongPlacement Placement
    )
    {
        public double Stretch => Placement.Stretch;
    }
}
