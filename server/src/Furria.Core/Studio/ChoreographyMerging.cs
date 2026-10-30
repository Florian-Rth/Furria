using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ChoreographyMerging
{
    [Pure]
    public static ChoreographyMerge Merged(
        ChoreographyDocument baseline,
        ChoreographyDocument current,
        IReadOnlyList<SpotTrack> patch,
        ActMusic music
    )
    {
        var merged = patch
            .Select(track =>
                SpotMerge.Of(
                    TrackOf(baseline, track.SpotId),
                    TrackOf(current, track.SpotId),
                    track,
                    music
                )
            )
            .ToList();
        var overlaps = merged.Select(spot => spot.Overlap).OfType<ChoreographyOverlap>().ToList();

        return overlaps.Count > 0
            ? new ChoreographyMerge(current, overlaps)
            : new ChoreographyMerge(Applied(current, merged), []);
    }

    [Pure]
    private static SpotTrack? TrackOf(ChoreographyDocument document, int spotId) =>
        document.Tracks.FirstOrDefault(track => track.SpotId == spotId);

    [Pure]
    private static ChoreographyDocument Applied(
        ChoreographyDocument current,
        IReadOnlyList<SpotMerge> merged
    )
    {
        var taken = merged
            .Select(spot => spot.Track)
            .OfType<SpotTrack>()
            .ToDictionary(track => track.SpotId);
        var kept = current.Tracks.Select(track => taken.GetValueOrDefault(track.SpotId, track));
        var known = current.Tracks.Select(track => track.SpotId).ToHashSet();
        var added = merged
            .Select(spot => spot.Track)
            .OfType<SpotTrack>()
            .Where(track => !known.Contains(track.SpotId));

        return new ChoreographyDocument([.. kept, .. added]);
    }

    private sealed record SpotMerge(int SpotId, SpotTrack? Track, ChoreographyOverlap? Overlap)
    {
        [Pure]
        public static SpotMerge Of(
            SpotTrack? baseline,
            SpotTrack? current,
            SpotTrack patched,
            ActMusic music
        )
        {
            if (SameKeyframes(patched, baseline))
                return new SpotMerge(patched.SpotId, null, null);
            if ((current is null && baseline is null) || SameKeyframes(current, baseline))
                return new SpotMerge(patched.SpotId, patched, null);
            if (current is null)
                return Overlapping(patched.SpotId, ChangedAnchors(baseline, patched));

            return KeyframeMerge(baseline, current, patched, music);
        }

        [Pure]
        private static SpotMerge KeyframeMerge(
            SpotTrack? baseline,
            SpotTrack current,
            SpotTrack patched,
            ActMusic music
        )
        {
            var before = Keyed(baseline);
            var theirs = Keyed(current);
            var mine = Keyed(patched);
            var keys = before.Keys.Union(theirs.Keys).Union(mine.Keys).ToList();
            var clashing = keys.Where(key =>
                    Clashes(
                        before.GetValueOrDefault(key),
                        theirs.GetValueOrDefault(key),
                        mine.GetValueOrDefault(key)
                    )
                )
                .ToList();
            if (clashing.Count > 0)
                return Overlapping(patched.SpotId, clashing.Select(key => key.Anchor));

            var keyframes = keys.Select(key =>
                    Chosen(
                        before.GetValueOrDefault(key),
                        theirs.GetValueOrDefault(key),
                        mine.GetValueOrDefault(key)
                    )
                )
                .OfType<Keyframe>();

            return new SpotMerge(
                patched.SpotId,
                new SpotTrack(patched.SpotId, InMusicOrder(keyframes, music)),
                null
            );
        }

        [Pure]
        private static bool Clashes(Keyframe? before, Keyframe? theirs, Keyframe? mine) =>
            mine != before && theirs != before && mine != theirs;

        [Pure]
        private static Keyframe? Chosen(Keyframe? before, Keyframe? theirs, Keyframe? mine) =>
            mine == before ? theirs : mine;

        [Pure]
        private static SpotMerge Overlapping(int spotId, IEnumerable<MusicAnchor> anchors) =>
            new(spotId, null, new ChoreographyOverlap(spotId, [.. anchors.Distinct()]));

        [Pure]
        private static IEnumerable<MusicAnchor> ChangedAnchors(
            SpotTrack? baseline,
            SpotTrack patched
        )
        {
            var before = Keyed(baseline);
            var mine = Keyed(patched);

            return before
                .Keys.Union(mine.Keys)
                .Where(key => before.GetValueOrDefault(key) != mine.GetValueOrDefault(key))
                .Select(key => key.Anchor);
        }

        [Pure]
        private static bool SameKeyframes(SpotTrack? left, SpotTrack? right) =>
            (left?.Keyframes ?? []).SequenceEqual(right?.Keyframes ?? [])
            && (left is null) == (right is null);

        [Pure]
        private static Dictionary<KeyframeKey, Keyframe> Keyed(SpotTrack? track) =>
            (track?.Keyframes ?? [])
                .GroupBy(keyframe => keyframe.At)
                .SelectMany(sameAnchor =>
                    sameAnchor.Select(
                        (keyframe, occurrence) =>
                            (Key: new KeyframeKey(sameAnchor.Key, occurrence), Keyframe: keyframe)
                    )
                )
                .ToDictionary(entry => entry.Key, entry => entry.Keyframe);

        [Pure]
        private static IReadOnlyList<Keyframe> InMusicOrder(
            IEnumerable<Keyframe> keyframes,
            ActMusic music
        ) =>
            [
                .. keyframes
                    .OrderBy(keyframe =>
                        music.Locate(keyframe.At).TimelineSeconds ?? double.PositiveInfinity
                    )
                    .ThenBy(keyframe => keyframe.At.SourceMediaItemId)
                    .ThenBy(keyframe => keyframe.At.Seconds),
            ];
    }

    private readonly record struct KeyframeKey(MusicAnchor Anchor, int Occurrence);
}
